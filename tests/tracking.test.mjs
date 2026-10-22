// 使用真实插件、文件和会话事件验证任务闭环；排程故障由隔离适配器注入，不动用户数据。
import assert from "node:assert/strict";
import test from "node:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { IdeasRuntime } from "../dist/runtime.js";
import { fixture, signal } from "./helpers.mjs";

async function trackingFixture(t, templateId = "general-06") {
  const f = await fixture(t); const entries = []; let creates = 0, failDelete = false;
  const logs = new Map();
  f.services.readEvents = async id => logs.get(id) ?? [];
  f.services.workingDirectory = async () => f.config.dataDir;
  f.services.scheduler = () => ({
    async create(sessionId, request) {
      creates++; const record = { id: `schedule-${creates}`, sessionId, ...request, status: "active", scheduledAt: request.at ?? "2099-01-01T00:00:00Z" };
      entries.push(record); return record;
    },
    async catalog() { return structuredClone(entries); },
    async delete({ id }) { if (failDelete) throw new Error("delete failed"); const index = entries.findIndex(e => e.id === id); if (index >= 0) entries.splice(index, 1); },
  });
  const idea = (await f.runtime.startGeneral({ templateId, sessionId: "chat" }, signal())).ideas[0];
  const events = []; logs.set("chat", events);
  const emit = async (type, data) => { const event = { type, data, seq: events.length, time: Date.now() }; events.push(event); await f.runtime.tracker.capture("chat", event); return event; };
  await emit("turn/start", { turn: 1 });
  await emit("user/message", { turn: 1, source: { kind: "user", rpcId: idea.execution.requestId }, content: [{ type: "text", text: "我们开始吧！" }] });
  const report = input => f.runtime.tracker.report("chat", { idea_id: idea.id, summary: "已整理实际资料。", ...input }, events);
  const read = async () => (await f.runtime.snapshot()).ideas.find(i => i.id === idea.id);
  return { ...f, idea, entries, logs, events, emit, report, read, creates: () => creates, failDelete: () => { failDelete = true; } };
}

test("真实事件区分正在执行、缺关键资料、失败和本轮结束，不自动完成业务", async t => {
  const f = await trackingFixture(t);
  assert.equal((await f.read()).progress.run, "running");
  await f.emit("tool/call", { turn: 1, name: "ask_user_question", callId: "ask", arguments: "{}" });
  await f.emit("turn/end", { turn: 1, reason: { kind: "completed" } });
  assert.equal((await f.read()).progress.run, "waiting_input");
  await f.report({ state: "running" });
  await f.emit("tool/result", { turn: 1, message: { callId: "read", isError: true } });
  await f.emit("turn/end", { turn: 1, reason: { kind: "error" } });
  assert.equal((await f.read()).progress.run, "failed"); assert.equal((await f.read()).status, "started");
  await f.report({ state: "running" });
  await f.emit("turn/end", { turn: 1, reason: { kind: "completed" } });
  assert.equal((await f.read()).progress.run, "review");
});

test("审批按 callId 和审批编号关联，拒绝后不伪报正在成功执行", async t => {
  const f = await trackingFixture(t);
  await f.emit("tool/call", { turn: 1, name: "external_action", callId: "action", arguments: "{}" });
  await f.emit("approval/asked", { id: "approval", callId: "action" });
  assert.equal((await f.read()).progress.run, "waiting_approval");
  await f.emit("approval/decided", { id: "approval", outcome: "rejected" });
  assert.equal((await f.read()).progress.run, "waiting_input");
});

test("点击开始上下文要求直接推进；默认排程真实读回，重报及重启不重复创建", async t => {
  const f = await trackingFixture(t);
  assert.match(f.prompts[0].context, /不重复询问要不要建立定时任务/);
  await f.report({ state: "tracking" }); await f.report({ state: "tracking" });
  assert.equal(f.creates(), 1); assert.equal(f.entries[0].cron.expression, "0 8 * * *");
  let idea = await f.read(); assert.equal(idea.progress.followUp.state, "active");
  assert.equal(idea.progress.followUp.nextAt, f.entries[0].scheduledAt);
  const restored = new IdeasRuntime(f.config, f.services); t.after(() => restored.dispose());
  await restored.tracker.recover(); assert.equal(f.creates(), 1);
  assert.equal((await restored.snapshot()).ideas[0].progress.followUp.ids[0], f.entries[0].id);
  await f.emit("turn/end", { turn: 1, reason: { kind: "completed" } });
  assert.equal((await f.read()).progress.run, "tracking"); assert.equal((await f.read()).status, "started");
});

test("暂停删除真实排程，恢复重新建立，结束不表示目标达成", async t => {
  const f = await trackingFixture(t); await f.report({ state: "tracking" });
  let idea = await f.read();
  await f.runtime.update({ id: idea.id, revision: idea.revision, action: "pause" }); assert.equal(f.entries.length, 0);
  idea = await f.read(); assert.equal(idea.progress.lifecycle, "paused");
  await f.runtime.update({ id: idea.id, revision: idea.revision, action: "resume" }); assert.equal(f.entries.length, 1);
  idea = await f.read(); await f.runtime.update({ id: idea.id, revision: idea.revision, action: "stop" });
  idea = await f.read(); assert.equal(idea.progress.lifecycle, "stopped"); assert.equal(idea.status, "started"); assert.equal(f.entries.length, 0);
});

test("删除失败不能显示已暂停，排程不可用不能显示持续跟踪", async t => {
  const f = await trackingFixture(t); await f.report({ state: "tracking" }); f.failDelete();
  const idea = await f.read();
  await assert.rejects(f.runtime.update({ id: idea.id, revision: idea.revision, action: "pause" }), /delete failed/);
  assert.equal((await f.read()).progress.lifecycle, "active");
  f.services.scheduler = () => undefined;
  await f.report({ state: "tracking" });
  assert.equal((await f.read()).progress.followUp.state, "error"); assert.equal((await f.read()).progress.run, "failed");
});

test("模型文字和不存在的文件不能完成，真实 present 产物加完成口径报告才自动完成单次目标", async t => {
  const f = await trackingFixture(t, "general-11");
  await f.report({ state: "completed", completion_kind: "artifact", evidence_seqs: [] }); assert.equal((await f.read()).status, "started");
  const event = await f.emit("deliverables/presented", { turn: 1, callId: "present", files: [{ path: "repair.txt" }] });
  await f.report({ state: "completed", completion_kind: "artifact", evidence_seqs: [event.seq] }); assert.equal((await f.read()).status, "started");
  await writeFile(join(f.config.dataDir, "repair.txt"), "维修报价逐项对照与询价问题");
  await f.report({ state: "completed", completion_kind: "artifact", evidence_seqs: [event.seq] });
  assert.equal((await f.read()).status, "completed"); assert.ok((await f.read()).progress.lastVerifiedAt);
});

test("长期目标的构件和外部成功主张不自动结束跟踪", async t => {
  const f = await trackingFixture(t, "general-04");
  await writeFile(join(f.config.dataDir, "budget.txt"), "预算建议");
  const e = await f.emit("deliverables/presented", { turn: 1, callId: "present", files: [{ path: "budget.txt" }] });
  await f.report({ state: "completed", completion_kind: "artifact", evidence_seqs: [e.seq] }); assert.equal((await f.read()).status, "started");
  await f.report({ state: "completed", completion_kind: "external", evidence_seqs: [e.seq] }); assert.equal((await f.read()).status, "started");
});

test("跨会话、其他任务和同聊天无归属回合不能更新本任务，也不能借历史事件作为完成依据", async t => {
  const f = await trackingFixture(t);
  await assert.rejects(f.runtime.tracker.report("other", { idea_id: f.idea.id, state: "running", summary: "越权" }, f.events), /没有绑定/);
  const other = (await f.runtime.startGeneral({ templateId: "general-07", sessionId: "chat" }, signal())).ideas.find(i => i.templateId === "general-07");
  await assert.rejects(f.runtime.tracker.report("chat", { idea_id: other.id, state: "running", summary: "混淆目标" }, f.events), /没有绑定/);
  await f.emit("turn/start", { turn: 2 });
  await f.emit("user/message", { turn: 2, source: { kind: "user", rpcId: "unrelated" }, content: [{ type: "text", text: "聊点别的" }] });
  await assert.rejects(f.report({ state: "running" }), /没有绑定/);
  await f.emit("user/message", { turn: 2, source: { kind: "schedule" }, content: [{ type: "text", text: `【Ideas:${f.idea.id}】` }] });
  await assert.rejects(f.report({ state: "completed", evidence_seqs: [1] }), /不属于本轮/);
});

test("明确补充进展再次绑定原目标；手动完成会停止真实排程并保留来源", async t => {
  const f = await trackingFixture(t); await f.report({ state: "tracking" }); let idea = await f.read();
  await f.runtime.followup({ id: idea.id, revision: idea.revision, note: "晨报改成九点" }, signal());
  const prompt = f.prompts.at(-1); assert.equal(prompt.sessionId, "chat");
  const contexts = await f.runtime.handoffContexts("chat", [prompt.requestId]); assert.equal(contexts[0].ideaId, idea.id);
  idea = await f.read(); await f.runtime.update({ id: idea.id, revision: idea.revision, action: "complete", note: "已核对整体目标达成" });
  idea = await f.read(); assert.equal(idea.status, "completed"); assert.equal(f.entries.length, 0);
  assert.ok(idea.progress.activity.some(e => e.source === "用户操作"));
});

test("恢复补齐漏事件、到期删除排程；旧版 started 只迁移为待核对", async t => {
  const f = await trackingFixture(t); await f.report({ state: "tracking" });
  f.events.push({ type: "turn/end", seq: f.events.length, time: Date.now(), data: { turn: 1, reason: { kind: "interrupted" } } });
  const restored = new IdeasRuntime(f.config, f.services); t.after(() => restored.dispose()); await restored.tracker.recover();
  assert.equal((await restored.snapshot()).ideas[0].progress.run, "interrupted");
  await restored.store.transaction(async () => { const idea = await restored.store.read(f.idea.id); idea.progress.followUp.rule.until = "2020-01-01T00:00:00Z"; await restored.store.save(idea); });
  await restored.tracker.reconcile(); assert.equal(f.entries.length, 0); assert.equal((await restored.snapshot()).ideas[0].status, "started");
  await restored.store.transaction(async () => { const idea = await restored.store.read(f.idea.id); delete idea.progress; await restored.store.save(idea); });
  await restored.tracker.recover(); assert.equal((await restored.snapshot()).ideas[0].progress.run, "review");
});

test("关联聊天中的明确用户更新可自动收尾长期目标，普通无归属聊天不自行更新", async t => {
  const f = await trackingFixture(t, "general-04"); await f.report({ state: "tracking" });
  await f.emit("turn/end", { turn: 1, reason: { kind: "completed" } });
  await f.emit("turn/start", { turn: 2 });
  const e = await f.emit("user/message", { source: { kind: "user", rpcId: "human-update" }, content: [{ type: "text", text: "储蓄目标已经全部达成并核实，可以结束了。" }] });
  assert.equal((await f.read()).progress.run, "tracking");
  const inspected = JSON.parse(await f.report({ state: "inspect" })); assert.ok(inspected.evidence.some(item => item.seq === e.seq));
  await f.report({ state: "completed", completion_kind: "user_update", user_update_seq: e.seq, summary: "用户明确核实储蓄目标已经达成。" });
  assert.equal((await f.read()).status, "completed"); assert.equal(f.entries.length, 0);
});

test("进展交接丢失响应后复用原请求重试，避免重复执行", async t => {
  const f = await trackingFixture(t); let count = 0; const requests = [];
  f.services.prompt = async request => { requests.push(request); if (++count === 1) throw new Error("lost"); };
  let idea = await f.read(); await assert.rejects(f.runtime.followup({ id: idea.id, revision: idea.revision, note: "调整为九点" }, signal()));
  idea = await f.read(); await f.runtime.followup({ id: idea.id, revision: idea.revision, note: "调整为九点" }, signal());
  assert.equal(requests[0].requestId, requests[1].requestId); assert.equal((await f.read()).progress.pendingFollowup, undefined);
});

test("中断后普通聊天继续任务，复用本轮已引用的用户消息即可交付并完成，不要求重复编号", async t => {
  const f = await trackingFixture(t, "general-11");
  await f.emit("turn/end", { turn: 1, reason: { kind: "interrupted" } });
  await f.emit("turn/start", { turn: 2 });
  const user = await f.emit("user/message", { source: { kind: "user", rpcId: "continue-chat" }, content: [{ type: "text", text: "刚才都答过了，请继续给结果" }] });
  await writeFile(join(f.config.dataDir, "repair-confirmed.txt"), "根据已有回答更新报价对照并交付");
  const present = await f.emit("deliverables/presented", { turn: 2, callId: "present", files: [{ path: "repair-confirmed.txt" }] });
  const inspection = JSON.parse(await f.report({ state: "inspect" }));
  assert.equal(inspection.binding.bound, false); assert.ok(inspection.binding.userMessageSeqs.includes(user.seq));
  assert.match(inspection.binding.instruction, /无需重复/);
  // 和真实故障中的调用一致：只提交 evidence_seqs，不再另填 user_update_seq。
  const result = JSON.parse(await f.report({ state: "completed", completion_kind: "artifact", evidence_seqs: [user.seq, present.seq] }));
  assert.equal(result.lifecycle, "completed");
  const idea = await f.read(); assert.equal(idea.status, "completed"); assert.equal(idea.progress.artifacts.at(-1).seq, present.seq);
});

test("补发回合的无效证据和其他目标绑定仍被拒绝，失败调用不抢占归属", async t => {
  const f = await trackingFixture(t, "general-11");
  await f.emit("turn/end", { turn: 1, reason: { kind: "interrupted" } }); await f.emit("turn/start", { turn: 2 });
  const user = await f.emit("user/message", { source: { kind: "user", rpcId: "followup" }, content: [{ type: "text", text: "继续当前目标" }] });
  await assert.rejects(f.report({ state: "running", evidence_seqs: [user.seq, 9999] }), /不属于本轮/);
  assert.equal(JSON.parse(await f.report({ state: "inspect" })).binding.bound, false);
  const other = (await f.runtime.startGeneral({ templateId: "general-09", sessionId: "chat" }, signal())).ideas.find(i => i.templateId === "general-09");
  await f.emit("user/message", { turn: 2, source: { kind: "user", rpcId: other.execution.requestId }, content: [{ type: "text", text: "我们开始吧！" }] });
  await assert.rejects(f.report({ state: "running", evidence_seqs: [user.seq] }), /没有绑定/);
});

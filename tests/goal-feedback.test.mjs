// 在临时 Ideas 存储和隔离 Goals 服务中验证完成回写，不接触用户的目标或模型。
import assert from "node:assert/strict";
import test from "node:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { completeGoalTask, queueGoalFeedback } from "../dist/goal-feedback.js";
import { GoalSyncStatus } from "../dist/client/progress.js";
import { zh } from "../dist/client/locales.js";
import { createIdea } from "../dist/store.js";
import { draft, fixture, signal } from "./helpers.mjs";

// 沿用宿主 renderer 安装的 React DOM，避免引入第二套运行时依赖。
const require = createRequire(import.meta.url);
const rendererRequire = createRequire(require.resolve("@deepseek-ai/dsh-client-ui-renderer"));
const { renderToStaticMarkup } = rendererRequire("react-dom/server");

const reference = { goalId: "goal-1", taskId: "task-1", title: "建立基线记录" };
async function linkedFixture(t) {
  const f = await fixture(t); const writes = [];
  const goal = { id: reference.goalId, status: "active", tasks: [{ id: reference.taskId, status: "pending", notes: "保留原备注" }] };
  const service = {
    async get({ goalId }) { return goalId === goal.id ? structuredClone(goal) : null; },
    async updateTask(request) { writes.push(request); Object.assign(goal.tasks[0], request); return structuredClone(goal.tasks[0]); },
  };
  f.services.completeGoalTask = ref => completeGoalTask(service, ref);
  const idea = createIdea({ ...draft, basis: "goal", goalRef: reference },
    { query: "目标", provider: "test", model: "test" }, ["真实目标步骤"]);
  await f.runtime.store.transaction(() => f.runtime.store.save(idea));
  await f.runtime.start({ id: idea.id, revision: idea.revision, sessionId: "chat" }, signal());
  const read = () => f.runtime.store.transaction(() => f.runtime.store.read(idea.id));
  const complete = async () => {
    const current = await read();
    return f.runtime.update({ id: current.id, revision: current.revision, action: "complete", note: "已核对基线记录" });
  };
  return { ...f, idea: await read(), goal, writes, service, read, complete };
}

test("用户确认完成只更新关联步骤，保留整个目标及原备注，重复同步不再写入", async t => {
  const f = await linkedFixture(t); await f.complete();
  const idea = await f.read();
  assert.equal(idea.status, "completed"); assert.equal(idea.goalSync.state, "synced");
  assert.deepEqual(f.writes, [{ taskId: reference.taskId, status: "done" }]);
  assert.equal(f.goal.status, "active"); assert.equal(f.goal.tasks[0].notes, "保留原备注");
  await f.runtime.tracker.feedback.send(idea.id);
  await completeGoalTask(f.service, reference); assert.equal(f.writes.length, 1);
});

test("同步失败保留 Ideas 完成，错误可见，显式重试后成功且不重复执行任务", async t => {
  const f = await linkedFixture(t); const writer = f.services.completeGoalTask;
  f.services.completeGoalTask = async () => { throw new Error("Goals 暂时离线"); };
  await f.complete(); let idea = await f.read();
  assert.equal(idea.status, "completed"); assert.equal(idea.goalSync.state, "error");
  assert.match(idea.goalSync.error, /离线/); assert.equal(f.goal.tasks[0].status, "pending");
  const requests = f.prompts.length; f.services.completeGoalTask = writer;
  await f.runtime.update({ id: idea.id, revision: idea.revision, action: "syncGoal" });
  idea = await f.read(); assert.equal(idea.goalSync.state, "synced");
  assert.equal(f.prompts.length, requests); assert.equal(f.writes.length, 1);
});

test("自动完成须通过真实产物核验；普通进展和缺失产物不回写 Goals", async t => {
  const f = await linkedFixture(t);
  const path = join(f.config.dataDir, "baseline.md");
  const events = [
    { type: "turn/start", data: { turn: 1 } },
    { type: "user/message", data: { source: { kind: "user", rpcId: f.idea.execution.requestId }, content: [{ type: "text", text: "我们开始吧！" }] } },
    { type: "deliverables/presented", data: { turn: 1, files: [{ path }] } },
  ].map((event, seq) => ({ ...event, seq, time: Date.now() }));
  const report = input => f.runtime.tracker.report("chat", { idea_id: f.idea.id, summary: "已交付基线记录", ...input }, events);
  await report({ state: "running" });
  await report({ state: "completed", completion_kind: "artifact", evidence_seqs: [2] });
  assert.equal(f.writes.length, 0); assert.equal((await f.read()).goalSync, undefined);
  await writeFile(path, "真实的基线记录");
  const result = JSON.parse(await report({ state: "completed", completion_kind: "artifact", evidence_seqs: [2] }));
  assert.equal(result.lifecycle, "completed"); assert.equal(result.goalSync.state, "synced");
  assert.equal(f.goal.tasks[0].status, "done"); assert.equal(f.writes.length, 1);
});

test("恢复只续传已落盘的待发送反馈，历史完成卡片不会被自动回写", async t => {
  const f = await linkedFixture(t); let idea = await f.read();
  idea.status = "completed"; idea.completion = { at: new Date().toISOString(), note: "完成记录" };
  await f.runtime.store.transaction(() => f.runtime.store.save(idea));
  await f.runtime.tracker.feedback.recover(); assert.equal(f.writes.length, 0);
  queueGoalFeedback(idea); await f.runtime.store.transaction(() => f.runtime.store.save(idea));
  await f.runtime.tracker.feedback.recover(); assert.equal(f.writes.length, 1);
  assert.equal((await f.read()).goalSync.state, "synced");
});

test("失效、错误归属或已取消的步骤拒绝回写，服务未加载明确报错", async () => {
  let writes = 0;
  const service = { async get() { return { tasks: [{ id: reference.taskId, status: "cancelled" }] }; },
    async updateTask() { writes++; throw new Error("不应调用"); } };
  await assert.rejects(completeGoalTask(undefined, reference), /未加载/);
  await assert.rejects(completeGoalTask(service, reference), /已取消/);
  await assert.rejects(completeGoalTask(service, { ...reference, taskId: "other-task" }), /已删除/);
  await assert.rejects(completeGoalTask({ ...service, async get() { return null; } }, reference), /已删除/);
  assert.equal(writes, 0);
});

test("同步错误和重试入口可见，按钮仅提交同步请求", () => {
  const requests = [], idea = { id: "idea", revision: 3, goalSync: { state: "error", error: "Goals 离线" } };
  const api = { getSnapshot: () => ({ busy: false }), run: (...args) => { requests.push(args); return Promise.resolve(true); } };
  const props = { idea, api, t: key => zh[key] };
  const html = renderToStaticMarkup(React.createElement(GoalSyncStatus, props));
  assert.match(html, /Ideas 已完成，Goals 同步失败/); assert.match(html, /Goals 离线/); assert.match(html, /重试同步 Goals/);
  GoalSyncStatus(props).props.children[2].props.onClick();
  assert.deepEqual(requests, [["update", { id: "idea", revision: 3, action: "syncGoal" }]]);
});

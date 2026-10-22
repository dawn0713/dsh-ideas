// 验证持久化、状态转换、并发与不确定投递恢复，而非只检查实现细节。
import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { IdeasRuntime } from "../dist/runtime.js";
import { resolveConfig } from "../dist/config.js";
import { memoryEvidence, parseIdeas } from "../dist/generate.js";
import { draft, fixture, signal } from "./helpers.mjs";

test("检索、推荐、采纳、发送和完成记录可从 Markdown 恢复", async t => {
  const f = await fixture(t);
  let state = await f.runtime.generate({ query: "个人 AI 项目" }, signal());
  let idea = state.ideas[0];
  assert.equal(idea.status, "suggested");
  assert.deepEqual(f.searches, [{ path: "/search", method: "POST", body: { query: "个人 AI 项目", limit: 8 } }]);
  assert.match(f.generations[0].input.memories[0].text, /个人 AI/);
  const file = await readFile(join(f.config.dataDir, `${idea.id}.md`), "utf8");
  assert.match(file, /## 执行指令/);
  assert.match(file, /## 记忆依据/);
  state = await f.runtime.update({ id: idea.id, revision: idea.revision, action: "adopt" });
  idea = state.ideas[0];
  assert.equal(idea.status, "adopted");
  assert.equal(f.prompts.length, 0);
  idea = (await f.runtime.start({ id: idea.id, revision: idea.revision, sessionId: "session-a" }, signal())).ideas[0];
  assert.equal(idea.status, "started");
  assert.equal(idea.completion, undefined);
  assert.match(f.prompts[0].context, /修改源码前先征求用户同意/);
  assert.equal(f.prompts[0].sessionId, "session-a");
  idea = (await f.runtime.update({ id: idea.id, revision: idea.revision, action: "complete", note: "已生成验收清单：docs/checklist.md" })).ideas[0];
  const restored = new IdeasRuntime(f.config, f.services);
  t.after(() => restored.dispose());
  assert.deepEqual((await restored.snapshot()).ideas[0], idea);
  assert.equal(idea.status, "completed");
  assert.equal(idea.completion.note, "已生成验收清单：docs/checklist.md");
  assert.equal(f.searches.length, 1);
});

test("ReMe 无记忆或报错时停止，不调用模型和保存通用推荐", async t => {
  for (const options of [{ memory: { success: true, answer: "" } }, { memory: { success: false, answer: "failed" } }, { httpStatus: 503 }]) {
    const f = await fixture(t, options);
    await assert.rejects(f.runtime.generate({}, signal()));
    assert.equal(f.generations.length, 0);
    assert.equal((await f.runtime.snapshot()).ideas.length, 0);
  }
});

test("ReMe 多条命中分别编号，建议保留所引用记忆的文件和行号", async t => {
  // 模拟真实 ReMe：answer 是聚合文本，metadata.results 才是逐条检索命中。
  const results = ["采购待审批", "合同责任待明确", "交付人员缺一名"].map((text, index) => ({
    text, path: `daily/project-${index + 1}.md`, start_line: 9, end_line: 12,
  }));
  const memory = { success: true, answer: results.map(item => item.text).join("\n"), metadata: { results } };
  const f = await fixture(t, { memory, output: JSON.stringify({ ideas: [{ ...draft, evidenceIds: [1, 2, 3] }] }) });
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  // 三条事实各自拥有合法编号；来源随记忆传给模型并持久保存，便于复核。
  assert.deepEqual(f.generations[0].input.memories.map(item => item.id), [1, 2, 3]);
  assert.deepEqual(idea.evidence.map(text => JSON.parse(text)), results);
  assert.deepEqual(idea.evidenceIds, [1, 2, 3]);
  // 仍拒绝不存在的编号，不通过放宽校验掩盖模型引用错误。
  const invalid = await fixture(t, { memory, output: JSON.stringify({ ideas: [{ ...draft, evidenceIds: [4] }] }) });
  await assert.rejects(invalid.runtime.generate({}, signal()), /记忆依据/);
  assert.equal((await invalid.runtime.snapshot()).ideas.length, 0);
});

test("旧版 ReMe 或没有有效结构化命中时，仍能从 answer 读取记忆", async t => {
  // 缺少、为空或不可用的结果不能遮蔽旧服务已经返回的有效正文。
  for (const metadata of [undefined, { results: [] }, { results: [null, { text: " " }, { text: 3 }] }]) {
    const f = await fixture(t, { memory: { success: true, answer: "旧版服务中的项目记忆", metadata } });
    const idea = (await f.runtime.generate({}, signal())).ideas[0];
    assert.deepEqual(idea.evidence, ["旧版服务中的项目记忆"]);
  }
});

test("模型无效、引用不存在及重复建议不会产生错误记录", async t => {
  for (const output of ["not json", JSON.stringify({ ideas: [{ ...draft, evidenceIds: [9] }] }), JSON.stringify({ ideas: [{ title: "x" }] })]) {
    const f = await fixture(t, { output });
    await assert.rejects(f.runtime.generate({}, signal()));
    assert.equal((await f.runtime.snapshot()).ideas.length, 0);
  }
  const f = await fixture(t);
  await f.runtime.generate({}, signal());
  await assert.rejects(f.runtime.generate({}, signal()), /没有新的 Ideas/);
  assert.equal((await f.runtime.snapshot()).ideas.length, 1);
});

test("投递结果不确定后重启，沿用原请求 ID 和目标会话重试", async t => {
  const f = await fixture(t, { prompt: (_request, _signal, count) => { if (count === 1) throw new Error("connection lost"); } });
  let idea = (await f.runtime.generate({}, signal())).ideas[0];
  await assert.rejects(f.runtime.start({ id: idea.id, revision: idea.revision, sessionId: "session-a" }, signal()), /connection lost/);
  idea = (await f.runtime.snapshot()).ideas[0];
  assert.equal(idea.status, "adopted");
  assert.equal(idea.execution.state, "pending");
  await assert.rejects(f.runtime.update({ id: idea.id, revision: idea.revision, action: "dismiss" }), /待确认/);
  const restored = new IdeasRuntime(f.config, f.services);
  t.after(() => restored.dispose());
  await assert.rejects(restored.start({ id: idea.id, revision: idea.revision, sessionId: "session-b" }, signal()), /原会话/);
  const result = await restored.start({ id: idea.id, revision: idea.revision, sessionId: "session-a" }, signal());
  assert.equal(result.ideas[0].status, "started");
  assert.equal(f.prompts[0].requestId, f.prompts[1].requestId);
  assert.equal(f.prompts[0].text, f.prompts[1].text);
});

test("双页面并发点击只投递一次；旧版本修改被拒绝", async t => {
  const f = await fixture(t);
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  const request = { id: idea.id, revision: idea.revision, sessionId: "session-a" };
  await Promise.all([f.runtime.start(request, signal()), f.runtime.start(request, signal())]);
  assert.equal(f.prompts.length, 1);
  await assert.rejects(f.runtime.update({ id: idea.id, revision: 1, action: "dismiss" }), /已更新/);
  const latest = (await f.runtime.snapshot()).ideas[0];
  await assert.rejects(f.runtime.update({ id: idea.id, revision: latest.revision, action: "complete", note: " " }), /完成说明/);
});

test("忽略和恢复可持久化；没有发送的推荐不能直接标记完成", async t => {
  const f = await fixture(t);
  let idea = (await f.runtime.generate({}, signal())).ideas[0];
  await assert.rejects(f.runtime.update({ id: idea.id, revision: idea.revision, action: "complete", note: "done" }), /当前状态/);
  idea = (await f.runtime.update({ id: idea.id, revision: idea.revision, action: "dismiss" })).ideas[0];
  assert.equal(idea.status, "dismissed");
  idea = (await f.runtime.update({ id: idea.id, revision: idea.revision, action: "restore" })).ideas[0];
  assert.equal(idea.status, "suggested");
});

test("取消中的生成不保存结果，并发生成被明确拒绝", async t => {
  let release;
  const entered = new Promise(resolve => { release = resolve; });
  const f = await fixture(t, { generate: async callSignal => {
    release();
    await new Promise((resolve, reject) => callSignal.addEventListener("abort", () => reject(callSignal.reason), { once: true }));
    return "";
  } });
  const controller = new AbortController();
  const request = f.runtime.generate({}, controller.signal);
  await entered;
  await assert.rejects(f.runtime.generate({}, signal()), /正在生成/);
  controller.abort();
  await assert.rejects(request);
  assert.equal((await f.runtime.snapshot()).generating, false);
  assert.deepEqual(await readdir(f.config.dataDir), []);
});

test("损坏文件和非法路径明确失败，不覆盖数据", async t => {
  const f = await fixture(t);
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  await assert.rejects(f.runtime.store.read("../../outside"), /ID 无效/);
  await writeFile(join(f.config.dataDir, `${idea.id}.md`), "broken", "utf8");
  await assert.rejects(f.runtime.snapshot(), /文件格式无效/);
});

test("配置边界和模型输出引用校验", () => {
  assert.throws(() => resolveConfig({ count: 0 }));
  assert.throws(() => resolveConfig({ remeEndpoint: "file:///tmp/memory" }));
  assert.throws(() => resolveConfig({ provider: "bailian" }));
  assert.throws(() => resolveConfig({ dataDir: "relative" }));
  assert.throws(() => resolveConfig({ timezone: "invalid/zone" }));
  assert.deepEqual(memoryEvidence([], 100), []);
  assert.deepEqual(memoryEvidence(["abcdef", "g"], 4), ["abcd"]);
  assert.equal(parseIdeas("```json\n" + JSON.stringify({ ideas: [draft] }) + "\n```", 1, 3).length, 1);
});

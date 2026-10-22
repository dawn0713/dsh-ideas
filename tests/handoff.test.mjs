// 前端真实缓存层连到业务 Runtime，验证后台并发和聊天交接，不发送真实会话任务。
import assert from "node:assert/strict";
import test from "node:test";
import { createIdeasApi } from "../dist/client/api.js";
import { draft, fixture, signal } from "./helpers.mjs";

function apiFor(t, f, navigation) {
  const api = createIdeasApi({ async call(_channel, endpoint, payload, caller) {
    try {
      const method = endpoint.split("/")[1];
      return { ok: true, value: method === "list" ? await f.runtime.snapshot() : await f.runtime[method](payload.args.request, caller) };
    } catch (error) { return { ok: false, error: { code: "test", message: error.message } }; }
  } }, navigation);
  t.after(() => api.dispose());
  return api;
}

test("没有会话时创建一次，交接上下文后打开聊天，双击不会重复创建或执行", async t => {
  const f = await fixture(t);
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  const opened = [];
  let created = 0;
  const api = apiFor(t, f, { createSession: async () => { created++; return "new-chat"; }, openSession: id => opened.push(id) });
  await api.refresh();
  await Promise.all([api.run("start", { id: idea.id, revision: idea.revision }), api.run("start", { id: idea.id, revision: idea.revision })]);
  assert.equal(created, 1);
  assert.equal(f.prompts.length, 1);
  assert.deepEqual(opened, ["new-chat"]);
  assert.match(f.prompts[0].context, /卡片提供的背景材料/);
});

test("自定义生成尚未结束仍能点击旧卡进入主聊天", async t => {
  let calls = 0, release, entered;
  const started = new Promise(resolve => { entered = resolve; });
  const f = await fixture(t, { generate: async () => {
    if (++calls === 1) return JSON.stringify({ ideas: [draft] });
    entered();
    return new Promise(resolve => { release = () => resolve(JSON.stringify({ ideas: [{ ...draft, title: "另一个新任务" }] })); });
  } });
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  const opened = [];
  const api = apiFor(t, f, { createSession: async () => "unused", openSession: id => opened.push(id) });
  await api.refresh();
  const generation = api.run("generate", {});
  await started;
  assert.equal(api.getSnapshot().generating, true);
  assert.equal(api.getSnapshot().busy, false);
  assert.equal(await api.run("start", { id: idea.id, revision: idea.revision, sessionId: "current" }), true);
  assert.deepEqual(opened, ["current"]);
  release();
  await generation;
  assert.equal(api.getSnapshot().ideas.find(item => item.id === idea.id).status, "started");
});

test("交接结果不明时不跳转，恢复后沿用原会话和请求 ID", async t => {
  const f = await fixture(t, { prompt: (_request, _caller, count) => { if (count === 1) throw new Error("confirmation lost"); } });
  const idea = (await f.runtime.generate({}, signal())).ideas[0];
  const opened = [];
  const api = apiFor(t, f, { createSession: async () => { throw new Error("不应创建新会话"); }, openSession: id => opened.push(id) });
  await api.refresh();
  assert.equal(await api.run("start", { id: idea.id, revision: idea.revision, sessionId: "original" }), false);
  assert.deepEqual(opened, []);
  const pending = api.getSnapshot().ideas[0];
  assert.equal(await api.run("start", { id: pending.id, revision: pending.revision, sessionId: "later-selection" }), true);
  assert.deepEqual(opened, ["original"]);
  assert.equal(f.prompts[0].requestId, f.prompts[1].requestId);
});

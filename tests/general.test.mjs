// 使用真实 Runtime、前端缓存和 React 组件验证通用目录，不访问用户会话或付费模型。
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import React, { act } from "react";
import { GENERAL_CATEGORIES, GENERAL_IDEAS } from "../dist/catalog.js";
import { IdeasRuntime } from "../dist/runtime.js";
import { createIdeasApi } from "../dist/client/api.js";
import { IdeasPanel } from "../dist/client/panel.js";
import { zh } from "../dist/client/locales.js";
import { createIdea } from "../dist/store.js";
import { isIdea } from "../dist/types.js";
import { parseIdeas } from "../dist/generate.js";
import { draft, fixture, signal } from "./helpers.mjs";

function apiFor(t, f, navigation) {
  const api = createIdeasApi({ async call(_channel, endpoint, payload, caller) {
    try { const method = endpoint.split("/")[1]; return { ok: true,
      value: method === "list" ? await f.runtime.snapshot() : await f.runtime[method](payload.args.request, caller) }; }
    catch (error) { return { ok: false, error: { code: "test", message: error.message } }; }
  } }, navigation);
  t.after(() => api.dispose());
  return api;
}

test("中国场景的四类通用目录共十九条，没有电费或英文文案", () => {
  assert.deepEqual(GENERAL_CATEGORIES.map(category => GENERAL_IDEAS.filter(item => item.category === category).length), [2, 2, 4, 11]);
  assert.equal(new Set(GENERAL_IDEAS.map(item => item.id)).size, 19);
  for (const item of GENERAL_IDEAS) assert.doesNotMatch([item.title, item.description, ...item.needs, item.deliverable].join(""), /电费|[a-z]/i);
});

test("无记忆且 ReMe 不可用时仍可交接通用任务，不伪造证据或放宽模型引用校验", async t => {
  const f = await fixture(t, { httpStatus: 503 });
  const result = await f.runtime.startGeneral({ templateId: "general-01", sessionId: "chat" }, signal());
  const idea = result.ideas[0];
  assert.equal(idea.source, "general"); assert.deepEqual(idea.evidence, []); assert.deepEqual(idea.evidenceIds, []);
  assert.equal(isIdea(idea), true); assert.equal(idea.status, "started");
  assert.equal(f.searches.length, 0); assert.equal(f.generations.length, 0); assert.equal(f.prompts.length, 1);
  assert.match(f.prompts[0].context, /不是根据个人记忆/);
  assert.throws(() => parseIdeas(JSON.stringify({ ideas: [idea] }), 0, 3), /记忆依据/);
  await assert.rejects(f.runtime.startGeneral({ templateId: "unknown", sessionId: "chat" }, signal()), /不存在/);
  assert.equal((await f.runtime.snapshot()).ideas.length, 1);
});

test("通用任务重启后重试沿用原会话和请求，已交接的重复点击不再发送", async t => {
  const f = await fixture(t, { prompt: (_request, _signal, count) => { if (count === 1) throw new Error("lost response"); } });
  await assert.rejects(f.runtime.startGeneral({ templateId: "general-02", sessionId: "original" }, signal()));
  const restored = new IdeasRuntime(f.config, f.services); t.after(() => restored.dispose());
  await restored.startGeneral({ templateId: "general-02", sessionId: "later" }, signal());
  await restored.startGeneral({ templateId: "general-02", sessionId: "another" }, signal());
  assert.equal(f.prompts.length, 2); assert.equal(f.prompts[0].requestId, f.prompts[1].requestId);
  assert.equal(f.prompts[1].sessionId, "original"); assert.equal((await restored.snapshot()).ideas.length, 1);
});

test("无个性化卡片也展示四类目录，查看详情不创建会话，明确开始才交接一次", async t => {
  const require = createRequire(import.meta.url);
  const renderer = createRequire(require.resolve("@deepseek-ai/dsh-client-ui-renderer"));
  const { JSDOM } = renderer("jsdom"); const { createRoot } = renderer("react-dom/client");
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "http://127.0.0.1/" });
  const old = new Map();
  for (const key of ["window", "document", "navigator", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"]) {
    old.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] });
  }
  const root = createRoot(document.getElementById("root"));
  t.after(async () => { await act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of old) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  const f = await fixture(t, { httpStatus: 503 }); let created = 0; const opened = [];
  let delivered; const delivery = new Promise(resolve => { delivered = resolve; });
  const api = apiFor(t, f, { createSession: async () => { created++; return "new-chat"; }, openSession: id => { opened.push(id); delivered(); } });
  await act(async () => { root.render(React.createElement(IdeasPanel, { api, t: key => zh[key], compact: true })); });
  assert.equal(document.querySelectorAll(".pai-ideas-general-row").length, 19);
  assert.deepEqual([...document.querySelectorAll(".pai-ideas-general h2")].map(item => item.textContent), GENERAL_CATEGORIES);
  await act(async () => document.querySelector(".pai-ideas-general-row").click());
  assert.doesNotMatch(document.querySelector(".pai-ideas-sheet-body").textContent, /开始前需要/);
  assert.doesNotMatch(document.body.textContent, /记忆依据/);
  // 十九项均使用截图所示的详情结构，各自交付与运作说明不可退回共用占位内容。
  for (const item of GENERAL_IDEAS) {
    await act(async () => document.querySelector(".pai-ideas-sheet-header button").click());
    await act(async () => [...document.querySelectorAll(".pai-ideas-general-row")].find(row => row.textContent.includes(item.title)).click());
    assert.equal(document.querySelectorAll(".pai-ideas-includes li").length, item.includes.length);
    assert.ok(document.querySelector(".pai-ideas-sheet-menu summary"));
    assert.match(document.querySelector(".pai-ideas-sheet-how").textContent, new RegExp(item.howItWorks.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  await act(async () => document.querySelector(".pai-ideas-sheet-header button").click());
  await act(async () => document.querySelector(".pai-ideas-general-row").click());
  assert.equal(created, 0); assert.equal((await f.runtime.snapshot()).ideas.length, 0);
  const start = [...document.querySelectorAll("button")].find(item => item.textContent === "马上开始");
  // 等待真实异步文件写入与交接完成，不把 React 事件派发结束当作任务已经发送。
  await act(async () => { start.click(); start.click(); await delivery; });
  assert.equal(created, 1); assert.equal(f.prompts.length, 1); assert.deepEqual(opened, ["new-chat"]);
  assert.equal(f.searches.length, 0); assert.equal(f.generations.length, 0);
  assert.match(document.body.textContent, /查看会话/);
  await act(async () => document.querySelector(".pai-ideas-sheet-header button").click());
  await f.runtime.store.transaction(async () => {
    for (let i = 0; i < 6; i++) {
      const record = createIdea({ ...draft, title: `最新推荐${i}`, value: i === 0 ? 5 : 1 }, { query: "测试", provider: "test", model: "test" }, ["测试记忆"]);
      record.createdAt = new Date(Date.parse("2026-10-20T00:00:00Z") + i * 60000).toISOString();
      if (i === 5) record.status = "started";
      await f.runtime.store.save(record);
    }
  });
  await act(async () => api.refresh());
  assert.deepEqual([...document.querySelectorAll(".pai-ideas-card h2")].map(node => node.textContent.replace(" ↗", "")), ["最新推荐4", "最新推荐3", "最新推荐2"]);
  assert.equal(document.querySelectorAll(".pai-ideas-more").length, 0);
  const all = [...document.querySelectorAll(".pai-ideas-filters button")].find(button => button.textContent === "全部");
  await act(async () => all.click()); assert.equal(document.querySelectorAll(".pai-ideas-card").length, 7);
});

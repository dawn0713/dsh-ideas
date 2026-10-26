// 用真正的 DSH SlotCore 和 React DOM 验证侧边栏入口、当前会话绑定以及用户操作。
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import React, { act } from "react";
import { SlotCore } from "@deepseek-ai/dsh-client-ui-slots";
import { createIdea } from "../dist/store.js";
import { zh } from "../dist/client/locales.js";
import { draft } from "./helpers.mjs";

// 浏览器测试库沿用 DSH renderer 的已安装版本，保证 React 与宿主使用同一个实例。
const require = createRequire(import.meta.url);
const rendererRequire = createRequire(require.resolve("@deepseek-ai/dsh-client-ui-renderer"));
const { JSDOM } = rendererRequire("jsdom");

test("真实槽注册、独立页面和右侧栏渲染、采纳、发送与完成", async t => {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', { url: "http://127.0.0.1/" });
  const old = new Map();
  let root;
  const cleanups = [];
  for (const key of ["window", "document", "navigator", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"]) {
    old.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] });
  }
  t.after(async () => {
    if (root) await act(async () => root.unmount());
    cleanups.reverse().forEach(dispose => dispose());
    dom.window.close(); for (const [key, descriptor] of old) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } });
  const { createRoot } = rendererRequire("react-dom/client");
  const core = new SlotCore();
  core.register({ name: "root", children: { main: { kind: "keyed", scope: "root" },
    "sidebar.panellist": { kind: "list", scope: "root" }, "sidebar.right.pane.tab": { kind: "keyed", scope: "session" },
    "conversation.session.header.utilities": { kind: "list", scope: "session" }, "conversation.chat.node": { kind: "keyed", scope: "session" } } }, () => null);
  const registrations = [];
  const tabs = [];
  const opened = [];
  const handed = [];
  const requests = [];
  let currentKey = "session-a";
  const currentListeners = new Set();
  let idea = createIdea(draft, { query: "test", provider: "bailian", model: "test" }, ["用户正在推进个人 AI 项目"]);
  let mixedIdeas;
  const snapshot = () => ({ ideas: mixedIdeas ?? [idea], generating: false, route: { provider: "bailian", model: "test" }, storageDir: "/preview/ideas" });
  const ctx = {
    get: key => key === "sessions" ? { create: async () => "new-session" } : ({ rpc: { async call(_channel, endpoint, payload) {
      requests.push({ endpoint, payload });
      const request = payload.args.request;
      if (endpoint === "ideas/update") {
        if (request.action === "adopt") idea = { ...idea, status: "adopted", revision: idea.revision + 1 };
        if (request.action === "complete") idea = { ...idea, status: "completed", revision: idea.revision + 1,
          completion: { at: new Date().toISOString(), note: request.note } };
      }
      if (endpoint === "ideas/start") idea = { ...idea, status: "started", revision: idea.revision + 1,
        execution: { sessionId: request.sessionId, requestId: "test-request", state: "accepted" } };
      return { ok: true, value: snapshot() };
    } } }),
    effect(callback) { const dispose = callback(); if (dispose) cleanups.push(dispose); },
    on: () => () => {},
    locale: { bind: () => key => zh[key] ?? key, register: () => () => {} },
    layout: { selectPanel: id => opened.push(id) },
    sidebarRight: { openTab: kind => opened.push(kind), isExpanded: () => true, toggleExpanded: () => opened.push("collapsed") },
    uiConversation: { events: { register: () => () => {} } },
    uiWorkspace: { openSession: id => handed.push(id) },
    sidebarRightTabs: { register: definition => { tabs.push(definition); return () => {}; } },
    uiSession: { adapter: { current: { getSnapshot: () => ({ key: currentKey }), subscribe: listener => {
      currentListeners.add(listener); return () => currentListeners.delete(listener);
    } } } },
    slots: { inject: (_key, callback) => { const dispose = callback(); if (dispose) cleanups.push(dispose); },
      register: (options, component) => { registrations.push({ options, component }); return core.register(options, component); } },
  };
  let module;
  dom.window.__ModuleLoader__ = { load: value => { module = value; } };
  const bundle = await readFile(new URL("../dist/client.js", import.meta.url), "utf8");
  vm.runInNewContext(bundle, { window: dom.window, document: dom.window.document, AbortController, console, setInterval, clearInterval });
  assert.equal(module.id, "@personal-ai/ideas-dsh-plugin");
  module.factory(require).apply(ctx);
  assert.equal(core.entries("main").length, 1);
  assert.equal(core.entries("sidebar.right.pane.tab").length, 1);
  assert.equal(core.entries("sidebar.panellist")[0].options.label(), "Ideas");
  assert.equal(tabs[0].kind, "ideas");
  const main = registrations.find(row => row.options.name === "main");
  const side = registrations.find(row => row.options.name === "sidebar.right.pane.tab");
  // 保留侧边栏入口，同时确认真实聊天头部没有 Ideas 按钮注册。
  assert.equal(core.entries("conversation.session.header.utilities").length, 0);
  root = createRoot(document.getElementById("root"));
  const props = { ...main.options.inject(), t: key => zh[key], useSessions: select => select({ byId: {
    "session-a": { displayTitle: "会话 A" }, "session-b": { displayTitle: "会话 B" },
  } }) };
  await act(async () => { root.render(React.createElement(main.component, props)); });
  const button = label => [...document.querySelectorAll("button")].find(item => item.textContent.includes(label));
  assert.match(document.body.textContent, /完善个人 AI 演示/);
  assert.match(document.body.textContent, /会话 A/);
  await act(async () => { button("采纳").click(); });
  assert.equal(idea.status, "adopted");
  assert.equal(requests.filter(row => row.endpoint === "ideas/start").length, 0);
  await act(async () => { currentKey = "session-b"; currentListeners.forEach(listener => listener()); });
  await act(async () => { document.querySelector(".pai-ideas-description").click(); });
  assert.equal(requests.filter(row => row.endpoint === "ideas/start").length, 0);
  assert.match(document.body.textContent, /包含哪些内容/);
  assert.match(document.body.textContent, /如何运作/);
  await act(async () => { button("马上开始").click(); });
  assert.equal(requests.find(row => row.endpoint === "ideas/start").payload.args.request.sessionId, "session-b");
  assert.deepEqual(handed, ["session-b"]);
  assert.equal(opened.at(-1), "collapsed");
  await act(async () => { document.querySelector(".pai-ideas-sheet-menu > summary").click(); button("确认完成").click(); });
  const textarea = document.querySelector(".pai-ideas-sheet-body > form textarea");
  assert.ok(textarea);
  // 通过原生 setter 派发输入事件，让 React 读取真实用户输入。
  const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set;
  await act(async () => { setter.call(textarea, "产物已验证"); textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true })); });
  assert.equal(button("保存完成记录").disabled, false);
  await act(async () => { document.querySelector(".pai-ideas-sheet-body > form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
  assert.equal(idea.status, "completed");
  assert.equal(idea.completion.note, "产物已验证");
  await act(async () => { root.render(React.createElement(side.component, { ...props, ...side.options.inject(), sessionId: "session-a" })); });
  assert.ok(document.querySelector(".pai-ideas-compact"));
  assert.match(document.body.textContent, /会话 A/);
  await act(async () => { button("打开 Ideas").click(); });
  assert.equal(opened.at(-1), "personal-ideas");
  const quote = registrations.find(row => row.options.name === "conversation.chat.node");
  await act(async () => { root.render(React.createElement(quote.component, { t: props.t, node: { data: { title: "建议标题", ideaId: idea.id } } })); });
  assert.match(document.body.textContent, /你选择了 Ideas/);
  assert.match(document.body.textContent, /建议标题/);
  assert.doesNotMatch(document.body.textContent, /验收清单|evidence|instruction/);
  // 在真实浏览器组件中验证：前三张卡不能因记忆更新或分数更高而挤掉目标来源。
  mixedIdeas = Array.from({ length: 4 }, (_, n) => ({ ...createIdea({ ...draft, title: `来源测试${n}` },
    { query: "test", provider: "bailian", model: "test" }, ["事实依据"]), basis: n === 3 ? "goal" : "memory",
    createdAt: new Date(Date.now() - n * 1000).toISOString(),
    ...(n === 3 ? { goalRef: { goalId: "g", taskId: "t", title: "未完成步骤" }, goal: "真实目标" } : {}) }));
  await act(async () => { root.render(React.createElement(main.component, props)); });
  await act(async () => { button("刷新").click(); });
  const cards = [...document.querySelectorAll(".pai-ideas-grid > .pai-ideas-card")];
  assert.equal(cards.length, 3);
  assert.equal(cards.filter(card => card.textContent.includes("来自记忆")).length, 2);
  assert.equal(cards.filter(card => card.textContent.includes("来自目标")).length, 1);
  assert.match(cards[1].textContent, /未完成步骤/);
});

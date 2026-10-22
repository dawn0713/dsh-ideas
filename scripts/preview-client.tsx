/** 独立开发预览：使用真实插件组件和示例数据，所有操作只发生在浏览器内存中。 */
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { apply } from "../src/client/index.js";
import { zh } from "../src/client/locales.js";
import type { Idea } from "../src/types.js";
import { GENERAL_IDEAS } from "../src/catalog.js";

const now = new Date().toISOString();
const examples = [
  { title: "把个人 AI 想法整理成可验证的演示", description: "挑选三个最常用的工作场景，串起记忆检索、个性化推荐和执行反馈。",
    reason: "你正在推进个人 AI 项目，已经接入 ReMe 和 DSH。现在适合用一个小闭环验证实际价值。",
    includes: [{ title: "个人 AI 场景清单", description: "聚焦最值得优先验证的三个日常场景" }, { title: "最小演示验收表", description: "把记忆、建议和执行反馈串成可检查的闭环" }],
    howItWorks: "你先告诉我最想验证的场景，我会结合已有项目和长期记忆整理一条最小验证路径，再一起确认验收标准。需要修改代码时，我会先说明具体方案并征求你的同意。",
    instruction: "阅读现有个人 AI 演示，整理三个可验证的场景，并输出一份验收清单。涉及修改现有源码时，先列出具体方案并征求用户同意。" },
  { title: "回顾本周项目，找出最值得推进的一步", description: "把最近的决策和未完成事项梳理到一起，形成一份短小的下一步清单。",
    reason: "长期记忆显示你同时推进多个项目。聚焦一个具体阻塞，有助于把已有调研转化为行动。",
    instruction: "检索近期项目进展，汇总已经确认的决策与未完成事项；推荐一个可在 30 分钟内启动的行动，并说明验收标准。" },
  { title: "为常见操作整理一份复用清单", description: "把重复使用的启动、检查和验证步骤写成简洁说明，减少下一次切换成本。",
    reason: "你偏好用明确的验证步骤确认功能，也经常在多个工具之间切换。整理现有经验能减少重复操作。",
    instruction: "查看已有使用说明，整理常见启动、检查、验证和故障定位步骤。输出 Markdown 草稿，不修改现有程序或配置。" },
];
let ideas: Idea[] = examples.map((example, index) => ({ ...example, id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  evidenceIds: [1], evidence: ["示例记忆：用户正在推进个人 AI 项目，使用 DSH 与 ReMe，喜欢小规模验证和中文说明。"],
  status: "suggested", revision: 1, createdAt: now, updatedAt: now, goal: "验证个人 AI 的工作价值", source: "automatic", query: "个人工作与项目", provider: "bailian", model: "示例模型",
  history: [{ at: now, action: "generated" }] }));
let generating = false;
let refreshPreview = () => {};
let lastUpdated = now;
const registrations: { options: Record<string, any>; component: any }[] = [];
// 预览框架只模拟 DSH 的注册和 RPC 外壳，不在预览中启动 Agent 或连接模型。
const ctx: any = {
  get: (key: string) => key === "sessions" ? { create: async () => "preview-session" } : ({ rpc: { async call(_channel: string, endpoint: string, payload: any) {
    const request = payload.args.request;
    // 预览中的通用任务只在内存中创建，展示同样的详情与交接，不调用真实 Agent。
    if (endpoint === "ideas/startGeneral") {
      const template = GENERAL_IDEAS.find(item => item.id === request.templateId)!;
      let record = ideas.find(item => item.templateId === template.id);
      if (!record) {
        record = { title: template.title, description: template.description, instruction: template.instruction,
          reason: "通用点子目录", evidenceIds: [], evidence: [], source: "general", templateId: template.id,
          id: `a0000000-0000-4000-8000-${String(ideas.length + 1).padStart(12, "0")}`, status: "started", revision: 1,
          createdAt: now, updatedAt: now, query: "通用点子", provider: "bailian", model: "示例模型", history: [],
          execution: { sessionId: request.sessionId, requestId: "preview-general", state: "accepted" } };
        ideas.push(record);
      }
    }
    if (endpoint === "ideas/generate") {
      await new Promise(resolve => setTimeout(resolve, 400));
      ideas = ideas.map(idea => ({ ...idea, status: "suggested" }));
    }
    if (request?.id) ideas = ideas.map(idea => {
      if (idea.id !== request.id) return idea;
      const action = endpoint === "ideas/start" ? "started" : request.action;
      const status = action === "adjust" ? idea.status : ({ adopt: "adopted", dismiss: "dismissed", restore: "suggested", complete: "completed", started: "started" } as const)[action as "adopt"];
      return { ...idea, status, ...(action === "adjust" ? { feedback: [...(idea.feedback ?? []), { at: now, kind: "adjust" as const, note: request.note }] } : {}), revision: idea.revision + 1,
        history: [...idea.history, { at: now, action }],
        ...(action === "started" ? { execution: { sessionId: request.sessionId, requestId: "preview", state: "accepted" as const } } : {}),
        ...(action === "complete" ? { completion: { at: now, note: request.note } } : {}) };
    });
    return { ok: true, value: { ideas, generating, engine: { enabled: true, lastUpdatedAt: lastUpdated, nextAttemptAt: "", lastError: "", attemptsToday: 1 }, storageDir: "~/.dsh/ideas", route: { provider: "bailian", model: "示例模型" } } };
  } } }),
  effect: (callback: () => unknown) => callback(), on: (event: string, callback: () => void) => { if (event === "connection/reset") refreshPreview = callback; return () => {}; },
  locale: { bind: () => (key: keyof typeof zh) => zh[key], register: () => () => {} },
  layout: { selectPanel: (id: string | null) => window.dispatchEvent(new Event(id ? "preview:main" : "preview:chat")) },
  uiWorkspace: { openSession: () => window.dispatchEvent(new Event("preview:chat")) },
  sidebarRight: { openTab: () => window.dispatchEvent(new Event("preview:side")), isExpanded: () => true, toggleExpanded: () => {} },
  sidebarRightTabs: { register: () => () => {} },
  uiConversation: { events: { register: () => () => {} } },
  uiSession: { adapter: { current: { getSnapshot: () => ({ key: "preview-session" }), subscribe: () => () => {} } } },
  slots: { inject: (_name: string, callback: () => unknown) => callback(), register: (options: Record<string, unknown>, component: unknown) => {
    registrations.push({ options, component }); return () => {};
  } },
};
apply(ctx);
function Preview() {
  const [mode, setMode] = useState("main");
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const main = () => setMode("main");
    const side = () => setMode("side");
    const chat = () => setMode("chat");
    window.addEventListener("preview:main", main);
    window.addEventListener("preview:side", side);
    window.addEventListener("preview:chat", chat);
    return () => { window.removeEventListener("preview:main", main); window.removeEventListener("preview:side", side); window.removeEventListener("preview:chat", chat); };
  }, []);
  const entry = registrations.find(row => row.options.name === (mode === "main" ? "main" : "sidebar.right.pane.tab"))!;
  const Component = entry.component;
  const handed = ideas.find(idea => idea.execution?.state === "accepted");
  const Reference = registrations.find(row => row.options.name === "conversation.chat.node")!.component;
  return <><div className="preview-toolbar"><strong>Ideas · 开发预览</strong><span>示例数据 · 操作仅在内存中生效</span>
    <button onClick={() => {
      generating = true; refreshPreview();
      setTimeout(() => {
        const index = ideas.length + 1;
        ideas = [{ ...ideas[0]!, id: `a0000000-0000-4000-8000-${String(index).padStart(12, "0")}`, title: "后台准备的新建议：整理下一次验证", status: "suggested", revision: 1, history: [{ at: new Date().toISOString(), action: "generated" }], execution: undefined, completion: undefined, feedback: undefined }, ...ideas];
        generating = false; lastUpdated = new Date().toISOString(); refreshPreview();
      }, 1000);
    }}>模拟后台更新</button>
    <button onClick={() => setMode(mode === "main" ? "side" : "main")}>{mode === "main" ? "查看右侧栏" : "查看独立页面"}</button>
    <button onClick={() => { setDark(!dark); document.body.toggleAttribute("data-ds-dark-theme", !dark); }}>{dark ? "浅色" : "深色"}</button></div>
    <div className={mode === "side" ? "preview-side" : "preview-main"}>
      {mode === "chat" ? <section className="pai-preview-chat" style={{ color: dark ? "#dfe5ee" : "#202937" }}>
        <p className="pai-preview-label">主聊天栏 · 交接预览（示例回复）</p>
        <Reference node={{ data: { title: handed?.title || "当前建议", ideaId: handed?.id || "preview" } }} t={(key: keyof typeof zh) => zh[key]} />
        <div className="pai-preview-user">我们开始吧！</div>
        <div className="pai-preview-assistant">开始之前，我想先确认：<strong>你最希望优先验证哪个使用场景？</strong><p>告诉我后，我会结合你现有的个人 AI 项目，整理一条最小验证路径和验收清单。需要调整代码时，会先与你确认具体方案。</p></div>
        <button onClick={() => setMode("main")}>返回 Ideas</button>
      </section> : <Component {...entry.options.inject()} t={(key: keyof typeof zh) => zh[key]} sessionId="preview-session"
        useSessions={(select: (state: object) => unknown) => select({ byId: { "preview-session": { displayTitle: "个人 AI 项目" } } })} />}
    </div></>;
}
createRoot(document.getElementById("app")!).render(<Preview />);

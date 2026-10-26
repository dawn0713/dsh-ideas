/** 使用 DSH 正式 slot 扩展点贡献全页、左侧入口和右侧页签。 */
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-client-connection/client";
import type {} from "@deepseek-ai/dsh-client-locale/client";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
import type {} from "@deepseek-ai/dsh-client-ui-sidebar/client";
import type {} from "@deepseek-ai/dsh-client-ui-sidebar-right/client";
import type {} from "@deepseek-ai/dsh-client-ui-conversation/client";
import type {} from "@deepseek-ai/dsh-client-ui-workspace/client";
import type { ISessions } from "@deepseek-ai/dsh-api-session-controller/client";
import type { SessionId } from "@deepseek-ai/dsh-session/types";
import type {} from "@deepseek-ai/dsh-client-ui-session/client";
import type { MainPanelId } from "@deepseek-ai/dsh-client-ui-layout/client";
import type { PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";
import { useSyncExternalStore } from "react";
import { createIdeasApi, type IdeasApi } from "./api.js";
import { en, zh, type Translate } from "./locales.js";
import { Bulb, IdeasPanel } from "./panel.js";
import { styles } from "./styles.js";
import { registerIdeasChat } from "./chat.js";

declare module "@deepseek-ai/dsh-client-ui-slots" { interface LocaleNamespaceMap { "personalIdeas": keyof typeof zh } }
const NS = "personalIdeas";
const PANEL = "personal-ideas" as MainPanelId;
const TAB = "@personal-ai/ideas-dsh-plugin";
interface Injected {
  api: IdeasApi; onOpen: () => void; onBack: () => void;
  current: { subscribe(listener: () => void): () => void; getSnapshot(): { key?: string } };
}
export const inject = ["slots", "locale", "connection", "layout", "sidebarRightTabs", "sidebarRight", "uiSession", "uiWorkspace", "sessions", "uiConversation"];

export function apply(ctx: Context): void {
  // 同一工程同时编译 Host 与 Client；浏览器端按正式 ISessions 接口取服务，避免宿主同名类型混入。
  const sessions = ctx.get("sessions") as unknown as ISessions;
  const api = createIdeasApi(ctx.get("connection").rpc, {
    createSession: () => sessions.create(),
    openSession: id => {
      ctx.uiWorkspace.openSession(id as SessionId);
      if (ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
    },
  });
  const t = ctx.locale.bind(NS);
  registerIdeasChat(ctx);
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), "ideas.locale");
  ctx.effect(() => () => api.dispose(), "ideas.api");
  ctx.effect(() => {
    const element = document.createElement("style");
    element.dataset.pluginCss = TAB;
    element.textContent = styles;
    document.head.appendChild(element);
    return () => element.remove();
  }, "ideas.styles");
  const injected = (): Injected => ({ api, current: ctx.uiSession.adapter.current,
    onOpen: () => ctx.layout.selectPanel(PANEL), onBack: () => ctx.layout.selectPanel(null) });
  ctx.effect(() => ctx.sidebarRightTabs.register({ id: TAB, kind: "ideas", priority: "extension", title: () => t("title"),
    guide: [{ id: "ideas", order: 30, title: () => t("title"), description: () => t("compactSubtitle"), icon: Bulb }] }), "ideas.tab");
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL, locale: NS, inject: injected }, MainPage));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: PANEL, order: 20,
    locale: NS, label: () => t("title") }, Bulb));
  ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({ name: "sidebar.right.pane.tab", key: TAB,
    locale: NS, inject: injected }, SidebarPage));
  // Ideas 只通过侧边栏进入，不再向聊天右上角注册快捷按钮。
  ctx.on("connection/reset", () => { void api.refresh(); });
}

/** 独立页面订阅 DSH 正式的当前会话源；打开 Ideas 本身不改变会话选择。 */
function MainPage(props: PropsRuntime<"main"> & PropsLocale<typeof NS> & Injected) {
  const sessionId = useSyncExternalStore(listener => props.current.subscribe(listener), () => props.current.getSnapshot().key);
  const label = props.useSessions(state => sessionId ? state.byId[sessionId as keyof typeof state.byId]?.displayTitle : undefined);
  return <IdeasPanel api={props.api} t={props.t} sessionId={sessionId} sessionLabel={label} onBack={props.onBack} />;
}
/** 右侧页签始终绑定其所属会话，异步操作不会改投到后来切换的会话。 */
function SidebarPage(props: PropsRuntime<"sidebar.right.pane.tab"> & PropsLocale<typeof NS> & Injected) {
  const label = props.useSessions(state => state.byId[props.sessionId]?.displayTitle);
  return <IdeasPanel api={props.api} t={props.t} sessionId={props.sessionId} sessionLabel={label} compact onOpen={props.onOpen} />;
}

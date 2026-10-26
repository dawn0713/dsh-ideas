import { jsx as _jsx } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { createIdeasApi } from "./api.js";
import { en, zh } from "./locales.js";
import { Bulb, IdeasPanel } from "./panel.js";
import { styles } from "./styles.js";
import { registerIdeasChat } from "./chat.js";
const NS = "personalIdeas";
const PANEL = "personal-ideas";
const TAB = "@personal-ai/ideas-dsh-plugin";
export const inject = ["slots", "locale", "connection", "layout", "sidebarRightTabs", "sidebarRight", "uiSession", "uiWorkspace", "sessions", "uiConversation"];
export function apply(ctx) {
    // 同一工程同时编译 Host 与 Client；浏览器端按正式 ISessions 接口取服务，避免宿主同名类型混入。
    const sessions = ctx.get("sessions");
    const api = createIdeasApi(ctx.get("connection").rpc, {
        createSession: () => sessions.create(),
        openSession: id => {
            ctx.uiWorkspace.openSession(id);
            if (ctx.sidebarRight.isExpanded())
                ctx.sidebarRight.toggleExpanded();
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
    const injected = () => ({ api, current: ctx.uiSession.adapter.current,
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
function MainPage(props) {
    const sessionId = useSyncExternalStore(listener => props.current.subscribe(listener), () => props.current.getSnapshot().key);
    const label = props.useSessions(state => sessionId ? state.byId[sessionId]?.displayTitle : undefined);
    return _jsx(IdeasPanel, { api: props.api, t: props.t, sessionId: sessionId, sessionLabel: label, onBack: props.onBack });
}
/** 右侧页签始终绑定其所属会话，异步操作不会改投到后来切换的会话。 */
function SidebarPage(props) {
    const label = props.useSessions(state => state.byId[props.sessionId]?.displayTitle);
    return _jsx(IdeasPanel, { api: props.api, t: props.t, sessionId: props.sessionId, sessionLabel: label, compact: true, onOpen: props.onOpen });
}

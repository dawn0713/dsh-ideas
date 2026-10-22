import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { HANDOFF_SOURCE, isRecord } from "../types.js";
/** 普通上下文由 DSH 原生聊天隐藏，本定义只增加与短开场相邻的建议标题。 */
export const ideaReferenceDefinition = {
    kind: "personal-ideas-reference", target: "chat",
    match: event => event.type === "user/message" && isRecord(event.data.source)
        && event.data.source.kind === HANDOFF_SOURCE && typeof event.data.source.title === "string"
        && typeof event.data.source.ideaId === "string" ? { id: String(event.data.id), role: "start" } : null,
    start: (_context, match) => {
        if (match.event.type !== "user/message")
            throw new Error("Ideas 引用缺少上下文消息。");
        const source = match.event.data.source;
        return { title: source.title, ideaId: source.ideaId, seq: match.event.seq };
    },
    update: context => context.state,
    buildViewNode: context => context.state ? { key: context.key, id: context.id, target: "chat", kind: "personal-ideas-reference",
        anchorSeq: context.state.seq,
        // 引用独立于执行过程折叠，原始事件仍保留真实回合位置与完整资料供轨迹查看。
        location: { kind: "session" }, visibility: "visible", data: { title: context.state.title, ideaId: context.state.ideaId } } : null,
};
export function registerIdeasChat(ctx) {
    ctx.effect(() => ctx.uiConversation.events.register(ideaReferenceDefinition), "ideas.chat-reference");
    ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({ name: "conversation.chat.node",
        key: "personal-ideas-reference", locale: "personalIdeas" }, IdeaReference));
}
/** 只展示卡片标题，无执行指令、检索正文和 JSON；以 DSH 当前主题配色。 */
export function IdeaReference({ node, t }) {
    return _jsxs("div", { className: "pai-ideas-chat-reference", children: [_jsxs("span", { children: ["\u21A9 ", t("selectedIdea")] }), _jsx("blockquote", { children: node.data.title })] });
}

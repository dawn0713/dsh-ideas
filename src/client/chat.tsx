/** 在主聊天中呈现建议引用；原生用户气泡只显示“我们开始吧”，资料不渲染成正文。 */
import type { Context } from "@deepseek-ai/cordis";
import type { ConversationNodeDefinition } from "@deepseek-ai/dsh-client-ui-conversation/client";
import type { PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";
import type {} from "@deepseek-ai/dsh-client-ui-chat/client";
import { HANDOFF_SOURCE, isRecord } from "../types.js";

interface ReferenceData { title: string; ideaId: string }
interface ReferenceState extends ReferenceData { seq: number }
declare module "@deepseek-ai/dsh-client-ui-chat/client" {
  interface ChatNodeDataMap { "personal-ideas-reference": ReferenceData }
}

/** 普通上下文由 DSH 原生聊天隐藏，本定义只增加与短开场相邻的建议标题。 */
export const ideaReferenceDefinition: ConversationNodeDefinition<ReferenceState> = {
  kind: "personal-ideas-reference", target: "chat",
  match: event => event.type === "user/message" && isRecord(event.data.source)
    && event.data.source.kind === HANDOFF_SOURCE && typeof event.data.source.title === "string"
    && typeof event.data.source.ideaId === "string" ? { id: String(event.data.id), role: "start" } : null,
  start: (_context, match) => {
    if (match.event.type !== "user/message") throw new Error("Ideas 引用缺少上下文消息。");
    const source = match.event.data.source as unknown as ReferenceData;
    return { title: source.title, ideaId: source.ideaId, seq: match.event.seq };
  },
  update: context => context.state,
  buildViewNode: context => context.state ? { key: context.key, id: context.id, target: "chat", kind: "personal-ideas-reference",
    anchorSeq: context.state.seq,
    // 引用独立于执行过程折叠，原始事件仍保留真实回合位置与完整资料供轨迹查看。
    location: { kind: "session" }, visibility: "visible", data: { title: context.state.title, ideaId: context.state.ideaId } } : null,
};

export function registerIdeasChat(ctx: Context): void {
  ctx.effect(() => ctx.uiConversation.events.register(ideaReferenceDefinition), "ideas.chat-reference");
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({ name: "conversation.chat.node",
    key: "personal-ideas-reference", locale: "personalIdeas" }, IdeaReference));
}

/** 只展示卡片标题，无执行指令、检索正文和 JSON；以 DSH 当前主题配色。 */
export function IdeaReference({ node, t }: PropsRuntime<"conversation.chat.node", "personal-ideas-reference"> & PropsLocale<"personalIdeas">) {
  return <div className="pai-ideas-chat-reference"><span>↩ {t("selectedIdea")}</span><blockquote>{node.data.title}</blockquote></div>;
}

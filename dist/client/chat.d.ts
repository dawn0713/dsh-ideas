/** 在主聊天中呈现建议引用；原生用户气泡只显示“我们开始吧”，资料不渲染成正文。 */
import type { Context } from "@deepseek-ai/cordis";
import type { ConversationNodeDefinition } from "@deepseek-ai/dsh-client-ui-conversation/client";
import type { PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";
interface ReferenceData {
    title: string;
    ideaId: string;
}
interface ReferenceState extends ReferenceData {
    seq: number;
}
declare module "@deepseek-ai/dsh-client-ui-chat/client" {
    interface ChatNodeDataMap {
        "personal-ideas-reference": ReferenceData;
    }
}
/** 普通上下文由 DSH 原生聊天隐藏，本定义只增加与短开场相邻的建议标题。 */
export declare const ideaReferenceDefinition: ConversationNodeDefinition<ReferenceState>;
export declare function registerIdeasChat(ctx: Context): void;
/** 只展示卡片标题，无执行指令、检索正文和 JSON；以 DSH 当前主题配色。 */
export declare function IdeaReference({ node, t }: PropsRuntime<"conversation.chat.node", "personal-ideas-reference"> & PropsLocale<"personalIdeas">): import("react").JSX.Element;
export {};

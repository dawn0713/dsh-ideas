/** 将任务资料放入 DSH 原生上下文，用户消息只保留自然开场，轨迹仍可审阅完整资料。 */
import type { Context } from "@deepseek-ai/cordis";
import type { ContextFormed } from "@deepseek-ai/dsh-llm";
import type { IdeasRuntime } from "./runtime.js";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "personal-ideas-context": {
            kind: "personal-ideas-context";
            ideaId: string;
            title: string;
            requestId: string;
        } & ContextFormed;
    }
}
/** 按 RPC 请求 ID 精确关联卡片；用户手动输入同一句话不会凭空触发任务资料。 */
export declare function installHandoff(ctx: Context, runtime: IdeasRuntime): void;

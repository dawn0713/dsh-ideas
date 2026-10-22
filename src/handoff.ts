/** 将任务资料放入 DSH 原生上下文，用户消息只保留自然开场，轨迹仍可审阅完整资料。 */
import type { Context } from "@deepseek-ai/cordis";
import type { ContextFormed } from "@deepseek-ai/dsh-llm";
import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import type { IdeasRuntime } from "./runtime.js";
import { HANDOFF_SOURCE } from "./types.js";

declare module "@deepseek-ai/dsh-llm" {
  interface MessageSourceMap {
    "personal-ideas-context": { kind: "personal-ideas-context"; ideaId: string; title: string; requestId: string } & ContextFormed;
  }
}

/** 按 RPC 请求 ID 精确关联卡片；用户手动输入同一句话不会凭空触发任务资料。 */
export function installHandoff(ctx: Context, runtime: IdeasRuntime): void {
  ctx.on("agent/pre-step", async ({ agent, signal }, next): Promise<PreStepDecision> => {
    const decision = await next();
    if (decision.kind === "reject" || signal.aborted) return decision;
    const requestIds = decision.messages.flatMap(message => message.source.kind === "user" && "rpcId" in message.source
      ? [String(message.source.rpcId)] : []);
    const contexts = await runtime.handoffContexts(agent.id, requestIds);
    if (!contexts.length) return decision;
    signal.throwIfAborted();
    return { ...decision, messages: decision.messages.flatMap(message => {
      const source = message.source;
      const context = source.kind === "user" && "rpcId" in source ? contexts.find(item => item.requestId === source.rpcId) : undefined;
      if (!context) return [message];
      return [createUserMessage({ content: [{ type: "text", text: context.text }], source: {
        kind: HANDOFF_SOURCE, ideaId: context.ideaId, title: context.title, requestId: context.requestId,
        form: "snapshot", sections: [{ name: context.title, text: context.text }],
      } }), message];
    }) };
  });
}

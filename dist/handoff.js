import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { HANDOFF_SOURCE } from "./types.js";
/** 按 RPC 请求 ID 精确关联卡片；用户手动输入同一句话不会凭空触发任务资料。 */
export function installHandoff(ctx, runtime) {
    ctx.on("agent/pre-step", async ({ agent, signal }, next) => {
        const decision = await next();
        if (decision.kind === "reject" || signal.aborted)
            return decision;
        const requestIds = decision.messages.flatMap(message => message.source.kind === "user" && "rpcId" in message.source
            ? [String(message.source.rpcId)] : []);
        const contexts = await runtime.handoffContexts(agent.id, requestIds);
        if (!contexts.length)
            return decision;
        signal.throwIfAborted();
        return { ...decision, messages: decision.messages.flatMap(message => {
                const source = message.source;
                const context = source.kind === "user" && "rpcId" in source ? contexts.find(item => item.requestId === source.rpcId) : undefined;
                if (!context)
                    return [message];
                return [createUserMessage({ content: [{ type: "text", text: context.text }], source: {
                            kind: HANDOFF_SOURCE, ideaId: context.ideaId, title: context.title, requestId: context.requestId,
                            form: "snapshot", sections: [{ name: context.title, text: context.text }],
                        } }), message];
            }) };
    });
}

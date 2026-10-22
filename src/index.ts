/** DSH 0.2.1-alpha.2 Host 插件：复用模型服务和原生会话 prompt 接口。 */
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-agent-default-model";
import type {} from "@deepseek-ai/dsh-api-session-controller";
import type { SessionPromptRequest } from "@deepseek-ai/dsh-api-session-controller/types";
import { BlockAssembler } from "@deepseek-ai/dsh-llm";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { resolveConfig, type IdeasConfig } from "./config.js";
import { DEFAULT_QUERY, memoryEvidence } from "./generate.js";
import { IdeasRuntime } from "./runtime.js";
import { installHandoff } from "./handoff.js";
import { installProgressTool } from "./progress-tool.js";
import type { FollowUpScheduler, ProgressEvent } from "./tracking.js";
import { completeGoalTask, type GoalsWriter } from "./goal-feedback.js";

export { Config } from "./config.js";
export const name = "personal-ideas";
export const inject = ["llm", "agentDefaultModel", "sessionController"];

declare module "@deepseek-ai/cordis" {
  interface Context { ideasRuntime: IdeasRuntime }
  interface Events { "personalGoals/changed"(): void }
}
declare module "@deepseek-ai/dsh-typert-protocol" {
  interface RemoteErrorDetailsMap { "ideas/operation-failed": {} }
}

export function apply(ctx: Context, input: Partial<IdeasConfig> = {}): void {
  const config = resolveConfig(input);
  const runtime = new IdeasRuntime(config, {
    async memory(query, signal) {
      signal.throwIfAborted();
      // 后台读取全局记忆，不绑定或修改任何会话的记忆参与开关。
      const service = ctx.get("meowMemory") as { overview(query: string, limit: number): unknown } | undefined;
      if (!service) throw new Error("meow 记忆服务未加载或已停用。");
      const rows = await service.overview(query === DEFAULT_QUERY ? "" : query, config.searchLimit);
      signal.throwIfAborted();
      return memoryEvidence(rows, config.maxMemoryChars);
    },
    async goals() {
      // 只通过目标服务的只读接口获取实时进展，不直接读取或修改目标存储。
      const service = ctx.get("personalGoals") as { overview(): Promise<unknown> } | undefined;
      return service ? service.overview() : { goals: [], openTasks: [] };
    },
    async completeGoalTask(reference) {
      // 仅回写经过完成核验的关联步骤，整个目标仍由用户在 Goals 中确认完成。
      await completeGoalTask(ctx.get("personalGoals") as GoalsWriter | undefined, reference);
    },
    route: () => config.provider && config.model ? { provider: config.provider, model: config.model }
      : ctx.agentDefaultModel.currentSelection(),
    async generate(system, text, route, signal) {
      // 模型、API 地址和密钥全部沿用已注册的服务，不向前端传递密钥。
      // 思考模型可能先耗尽输出额度；只对长度截断扩大额度重试一次，不续接不完整 JSON。
      const budgets = [config.maxOutputTokens];
      if (config.maxOutputTokens < 16000) budgets.push(Math.min(config.maxOutputTokens * 2, 16000));
      for (const [attempt, maxTokens] of budgets.entries()) {
        const call = await ctx.llm.prepareCall({ ...route, maxTokens }, signal);
        const assembler = new BlockAssembler();
        for await (const chunk of call.stream({ ...call.config, system,
          messages: [{ role: "user", content: [{ type: "text", text }] }], signal })) {
          signal.throwIfAborted();
          assembler.push(chunk);
        }
        const finish = assembler.finish;
        if (finish.kind === "error" || finish.kind === "aborted") throw new Error(`模型调用失败：${finish.failure.code}`);
        if (finish.kind === "stop") return assembler.blocks().flatMap(block => block.type === "text" ? [block.text] : []).join("");
        if (finish.kind === "max-tokens") {
          if (attempt + 1 < budgets.length) continue;
          throw new Error(`Ideas 生成达到输出上限（${maxTokens} tokens）仍未完成。请缩小关注主题，或在插件配置中减少 count。`);
        }
        throw new Error(`Ideas 模型返回了不支持的结束原因：${finish.kind}。请使用支持纯文本 JSON 输出的模型。`);
      }
      throw new Error("Ideas 生成未获得完整结果。");
    },
    async prompt(request, signal) {
      // DSH 在原生 prompt 中持久化 requestId，并在重试时检查是否已接收。
      const payload: SessionPromptRequest = { sessionId: request.sessionId as SessionPromptRequest["sessionId"],
        requestId: request.requestId as SessionPromptRequest["requestId"], mode: "queue",
        content: [{ type: "text", text: request.text }], clientTimeZone: config.timezone };
      await ctx.sessionController.prompt(payload, signal);
    },
    // 可选能力缺失时在任务页明确报错，不声称已经建立真实跟踪。
    scheduler: () => ctx.get("schedule") as FollowUpScheduler | undefined,
    async readEvents(id) {
      const query = ctx.get("sessionQuery") as { readSession(id: string): Promise<{ events: ProgressEvent[] }> } | undefined;
      return (await query?.readSession(id))?.events;
    },
    async workingDirectory(id) {
      const query = ctx.get("sessionQuery") as { readSession(id: string): Promise<{ session: { cwd?: string } }> } | undefined;
      return (await query?.readSession(id))?.session.cwd;
    },
  });
  ctx.provide("ideasRuntime", runtime);
  installHandoff(ctx, runtime);
  ctx.inject(["tools"], inner => { inner.effect(() => installProgressTool(inner, runtime)); });
  ctx.effect(() => {
    runtime.engine.start();
    const recover = runtime.tracker.recover().catch(error => ctx.logger.warn(`Ideas 恢复失败：${String(error)}`));
    const timer = setInterval(() => { void runtime.tracker.reconcile().catch(error => ctx.logger.warn(`Ideas 跟踪检查失败：${String(error)}`)); }, config.checkIntervalMs);
    timer.unref();
    return async () => { clearInterval(timer); await recover; runtime.dispose(); };
  }, "ideas.lifecycle");
  ctx.on("session/event", (session, event) => {
    runtime.engine.capture(session, event);
    void runtime.tracker.capture(session.id, event).catch(error => ctx.logger.warn(`Ideas 进度记录失败：${String(error)}`));
  });
  ctx.on("session/disposed", session => runtime.engine.forget(session.id));
  // 目标进展变化参与下一次推荐；仍遵守原有十二小时间隔，不额外触发模型调用。
  ctx.on("personalGoals/changed", () => {
    void runtime.engine.changed().catch(error => ctx.logger.warn(`Ideas 目标更新记录失败：${String(error)}`));
  });
  void ctx.plugin(IdeasGateway);
}

/** 通过 DSH 自带的认证与 Typert 通道提供业务接口，无需额外开放 HTTP 端口。 */
export class IdeasGateway extends TypertRemoteService {
  static inject = ["ideasRuntime"];
  constructor(ctx: Context) { super(ctx, "ideas"); }
  @Remote("list")
  list() { return report(() => this.ctx.ideasRuntime.snapshot()); }
  @Remote("generate")
  generate(request: unknown, signal: AbortSignal) { return report(() => this.ctx.ideasRuntime.generate(request, signal)); }
  @Remote("update")
  update(request: unknown) { return report(() => this.ctx.ideasRuntime.update(request)); }
  @Remote("start")
  start(request: unknown, signal: AbortSignal) { return report(() => this.ctx.ideasRuntime.start(request, signal)); }
  @Remote("startGeneral")
  startGeneral(request: unknown, signal: AbortSignal) { return report(() => this.ctx.ideasRuntime.startGeneral(request, signal)); }
  @Remote("followup")
  followup(request: unknown, signal: AbortSignal) { return report(() => this.ctx.ideasRuntime.followup(request, signal)); }
}

/** 可预期的业务失败使用可显示的错误文本；取消和超时也返回明确提示。 */
async function report<T>(action: () => Promise<T>): Promise<T> {
  try { return await action(); }
  catch (error) {
    const message = error instanceof Error ? (error.name === "TimeoutError" ? "请求超时，请检查服务后重试。"
      : error.name === "AbortError" ? "操作已取消。" : error.message) : "Ideas 操作失败。";
    throw new RemoteError("ideas/operation-failed", message, {});
  }
}

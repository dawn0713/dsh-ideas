/** 双入口共享缓存；页面只读本地推荐，后台生成不占用卡片操作锁。 */
import { isIdea, isRecord, type Idea } from "../types.js";
import type { IdeasSnapshot } from "../runtime.js";

export interface Rpc {
  call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<
    { ok: true; value?: unknown } | { ok: false; error: { code: string; message: string } }>;
}
interface Navigation { createSession(): Promise<string>; openSession(id: string): void }
export interface ViewState extends IdeasSnapshot { loading: boolean; busy: boolean; error: string; notice: "" | "generated" | "updated" | "sent" }
export function createIdeasApi(rpc: Rpc, navigation?: Navigation) {
  let state: ViewState = { ideas: [], generating: false, storageDir: "", route: { provider: "", model: "" },
    engine: { enabled: true, lastUpdatedAt: "", nextAttemptAt: "", lastError: "", attemptsToday: 0 },
    loading: true, busy: false, error: "", notice: "" };
  let revision = 0, manual = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  const lifetime = new AbortController();
  const publish = (patch: Partial<ViewState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const invoke = async (method: string, request: object): Promise<IdeasSnapshot> => {
    const result = await rpc.call("/api", `ideas/${method}`, { args: method === "list" ? {} : { request } }, lifetime.signal);
    if (!result.ok) throw new Error(result.error.message || result.error.code);
    const value = result.value;
    if (!isRecord(value) || !Array.isArray(value.ideas) || !value.ideas.every(isIdea)
      || typeof value.generating !== "boolean" || typeof value.storageDir !== "string"
      || (value.sourceNotice !== undefined && typeof value.sourceNotice !== "string")
      || !isRecord(value.route) || typeof value.route.provider !== "string" || typeof value.route.model !== "string")
      throw new Error("Ideas RPC response is invalid.");
    const engine = value.engine;
    if (engine !== undefined && (!isRecord(engine) || typeof engine.enabled !== "boolean" || typeof engine.lastUpdatedAt !== "string"
      || typeof engine.nextAttemptAt !== "string" || typeof engine.lastError !== "string" || !Number.isInteger(engine.attemptsToday)))
      throw new Error("Ideas background status is invalid.");
    return { ideas: value.ideas, generating: value.generating || manual, storageDir: value.storageDir,
      sourceNotice: typeof value.sourceNotice === "string" ? value.sourceNotice : "",
      route: { provider: value.route.provider, model: value.route.model }, engine: (engine ?? state.engine) as IdeasSnapshot["engine"] };
  };
  const refresh = async () => {
    const request = ++revision;
    try {
      const snapshot = await invoke("list", {});
      if (!lifetime.signal.aborted && request === revision) publish({ ...snapshot, loading: false });
    } catch (error) {
      if (!lifetime.signal.aborted && request === revision) publish({ loading: false, error: errorText(error) });
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      // 仅在面板存在且页面可见时轻量读取，不以轮询触发检索或模型调用。
      if (!timer) {
        timer = setInterval(() => { if (typeof document === "undefined" || document.visibilityState !== "hidden") void refresh(); }, 15000);
        timer.unref?.();
      }
      return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = undefined; } };
    },
    refresh,
    dispose: () => { lifetime.abort(); clearInterval(timer); listeners.clear(); },
    openConversation(id: string) {
      try { navigation?.openSession(id); } catch (error) { publish({ error: errorText(error) }); }
    },
    /** 接受任务后才导航；失败保留原卡片和 pending，请求 ID 由 Host 持久化去重。 */
    async run(method: "generate" | "update" | "start" | "startGeneral" | "followup", input: object): Promise<boolean> {
      if (lifetime.signal.aborted || (method === "generate" ? state.generating : state.busy)) return false;
      ++revision;
      if (method === "generate") manual = true;
      publish({ error: "", notice: "", ...(method === "generate" ? { generating: true } : { busy: true }) });
      try {
        let request = input;
        const starting = method === "start" || method === "startGeneral";
        // 通用点子只传固定目录编号；已交接或待重试的任务继续绑定原会话。
        const matches = (item: Idea) => isRecord(input) && (method === "startGeneral"
          ? item.templateId === input.templateId && !["completed", "dismissed"].includes(item.status) && item.progress?.lifecycle !== "stopped" : item.id === input.id);
        if (starting && isRecord(input)) {
          const idea = state.ideas.find(matches);
          const sessionId = idea?.execution?.sessionId || input.sessionId || await navigation?.createSession();
          if (!sessionId) throw new Error("请先打开一个 DSH 会话。");
          request = { ...input, sessionId };
        }
        const snapshot = await invoke(method, request);
        ++revision;
        publish({ ...snapshot, loading: false, notice: method === "generate" ? "generated" : starting ? "sent" : "updated" });
        if (starting && isRecord(input)) {
          const idea = snapshot.ideas.find(matches);
          if (idea?.execution?.state === "accepted") navigation?.openSession(idea.execution.sessionId);
        }
        return true;
      } catch (error) {
        await refresh();
        if (!lifetime.signal.aborted) publish({ error: errorText(error) });
        return false;
      } finally {
        if (method === "generate") { manual = false; await refresh(); }
        else if (!lifetime.signal.aborted) publish({ busy: false });
      }
    },
  };
}
export type IdeasApi = ReturnType<typeof createIdeasApi>;
function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }

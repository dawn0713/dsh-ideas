import type { IdeasSnapshot } from "../runtime.js";
export interface Rpc {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{
        ok: true;
        value?: unknown;
    } | {
        ok: false;
        error: {
            code: string;
            message: string;
        };
    }>;
}
interface Navigation {
    createSession(): Promise<string>;
    openSession(id: string): void;
}
export interface ViewState extends IdeasSnapshot {
    loading: boolean;
    busy: boolean;
    error: string;
    notice: "" | "generated" | "updated" | "sent";
}
export declare function createIdeasApi(rpc: Rpc, navigation?: Navigation): {
    getSnapshot: () => ViewState;
    subscribe(listener: () => void): () => void;
    refresh: () => Promise<void>;
    dispose: () => void;
    openConversation(id: string): void;
    /** 接受任务后才导航；失败保留原卡片和 pending，请求 ID 由 Host 持久化去重。 */
    run(method: "generate" | "update" | "start" | "startGeneral" | "followup", input: object): Promise<boolean>;
};
export type IdeasApi = ReturnType<typeof createIdeasApi>;
export {};

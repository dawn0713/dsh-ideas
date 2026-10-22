/** Host 后台调度：持久化限频与近期对话，页面关闭不影响任务，卸载时清理。 */
import type { IdeasConfig } from "./config.js";
import type { IdeaStore } from "./store.js";
interface ContextText {
    role: "user" | "assistant";
    text: string;
}
export interface EngineSnapshot {
    enabled: boolean;
    lastUpdatedAt: string;
    nextAttemptAt: string;
    lastError: string;
    attemptsToday: number;
}
export declare class IdeasEngine {
    readonly config: IdeasConfig;
    private readonly store;
    private readonly run;
    private readonly generating;
    readonly now: () => number;
    private state?;
    private loading?;
    private timer?;
    private stopped;
    private disposed;
    private checking;
    private error;
    private readonly busy;
    private readonly turns;
    version: number;
    constructor(config: IdeasConfig, store: IdeaStore, run: () => Promise<unknown>, generating: () => boolean, now?: () => number);
    /** 只在 Host 生命周期启动一次；本地检查不会自行触发前端 RPC 或执行 Agent。 */
    start(): void;
    dispose(): void;
    private schedule;
    private load;
    private save;
    snapshot(): Promise<EngineSnapshot>;
    private day;
    context(): Promise<ContextText[]>;
    /** 反馈或新对话只标记变化；真正调用仍由限频检查控制。 */
    changed(messages?: ContextText[]): Promise<void>;
    completed(version: number): Promise<void>;
    /** 仅采集根会话正常完成的用户/助手文本，跳过工具、注入信息和失败回合。 */
    capture(session: {
        id: string;
        header?: {
            origin?: string;
        };
    }, event: {
        type: string;
        data: unknown;
    }): void;
    forget(id: string): void;
    /** 配额在请求前落盘；失败指数退避，重启后继续遵守配额，旧卡片不删除。 */
    check(): Promise<void>;
    /** 配置变慢后立即按新间隔约束旧状态，重启和新对话均不能绕过十二小时窗口。 */
    private nextAttempt;
}
export {};

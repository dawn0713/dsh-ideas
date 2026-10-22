import type { IdeasConfig } from "./config.js";
import { IdeaStore } from "./store.js";
import { type Idea } from "./types.js";
import { IdeasEngine, type EngineSnapshot } from "./engine.js";
import { IdeasTracker, type TrackingServices } from "./tracking.js";
export interface RuntimeServices extends TrackingServices {
    /** 运行时按需读取可选目标服务，不要求两个插件按固定顺序安装。 */
    goals?(): Promise<unknown>;
    /** 从宿主内的 meow 服务读取材料，不绕过插件的启用与目录配置。 */
    memory?(query: string, signal: AbortSignal): Promise<string[]>;
    route(): {
        provider: string;
        model: string;
    };
    generate(system: string, input: string, route: {
        provider: string;
        model: string;
    }, signal: AbortSignal): Promise<string>;
    prompt(request: {
        sessionId: string;
        requestId: string;
        text: string;
        context?: string;
    }, signal: AbortSignal): Promise<void>;
}
export interface IdeasSnapshot {
    ideas: Idea[];
    generating: boolean;
    storageDir: string;
    route: {
        provider: string;
        model: string;
    };
    engine: EngineSnapshot;
    sourceNotice?: string;
}
export declare class IdeasRuntime {
    readonly config: IdeasConfig;
    private readonly services;
    private generating;
    private readonly lifetime;
    readonly store: IdeaStore;
    readonly engine: IdeasEngine;
    readonly tracker: IdeasTracker;
    constructor(config: IdeasConfig, services: RuntimeServices, now?: () => number);
    dispose(): void;
    snapshot(): Promise<IdeasSnapshot>;
    /** 按需检索并生成，模型截断重试由服务处理；不建立额外记忆索引，也不自动执行推荐。 */
    generate(input: unknown, caller: AbortSignal, source?: "manual" | "automatic"): Promise<IdeasSnapshot>;
    /** 用户可纠正状态；暂停、结束和完成必须先核实关联排程确实停止。 */
    update(input: unknown): Promise<IdeasSnapshot>;
    /** 点击马上开始才创建通用任务；目录由宿主确定，客户端不能注入执行内容或记忆依据。 */
    startGeneral(input: unknown, caller: AbortSignal): Promise<IdeasSnapshot>;
    /**
     * 先保存目标会话和请求 ID，再走 DSH 原生 prompt；重试使用原 ID，避免网络重试重复执行。
     * 未收到确认时保留 pending，禁止换会话重发；收到 accepted 才标为 started。
     */
    start(input: unknown, caller: AbortSignal): Promise<IdeasSnapshot>;
    /** 仅为同一会话中已持久化的请求解析资料，避免把卡片上下文注入其他用户消息。 */
    handoffContexts(sessionId: string, requestIds: readonly string[]): Promise<{
        ideaId: string;
        requestId: string;
        title: string;
        text: string;
    }[]>;
    /** 从目标页补充进展带着原任务上下文交接，不把同一聊天的其他内容误记为本项目。 */
    followup(input: unknown, caller: AbortSignal): Promise<IdeasSnapshot>;
}
/** 投递的是用户选中的执行指令；记忆原文不作为额外系统指令注入会话。 */
export declare function executionText(idea: Idea): string;

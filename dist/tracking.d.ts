import { type Idea, type IdeaProgress } from "./types.js";
import type { IdeaStore } from "./store.js";
import { GoalFeedback, type GoalFeedbackServices } from "./goal-feedback.js";
/** 只使用 DSH 已有的排程服务，不另设后台执行器。 */
export interface FollowUpScheduler {
    create(sessionId: string, request: {
        title: string;
        prompt: string;
        cron?: {
            expression: string;
            time_zone: string;
        };
        at?: string;
    }): Promise<{
        id: string;
    }>;
    catalog(): Promise<{
        id: string;
        sessionId: string;
        prompt: string;
        status: string;
        scheduledAt: string;
    }[]>;
    delete(request: {
        sessionId: string;
        id: string;
    }): Promise<unknown>;
}
export interface ProgressEvent {
    type: string;
    seq: number;
    time: number;
    data: unknown;
}
export interface TrackingServices extends GoalFeedbackServices {
    scheduler?(): FollowUpScheduler | undefined;
    readEvents?(id: string): Promise<readonly ProgressEvent[] | undefined>;
    workingDirectory?(id: string): Promise<string | undefined>;
}
/** 初始化时不补造历史成功；旧版已交接任务保持待核对。 */
export declare function initialProgress(idea: Idea, legacy?: boolean): IdeaProgress;
/** 状态写入与卡片共用队列；每条活动标注事实来源，避免把无更新当作完成。 */
export declare class IdeasTracker {
    private readonly store;
    private readonly services;
    private readonly timezone;
    private readonly owners;
    private readonly turns;
    readonly feedback: GoalFeedback;
    constructor(store: IdeaStore, services: TrackingServices, timezone: string);
    private key;
    private bind;
    /** 首次载入只读历史，不启动 Agent；漏掉的事件按序重放，已处理事件不重复记账。 */
    recover(): Promise<void>;
    /** 仅请求、上下文或宿主排程能绑定任务；同一聊天中的普通消息不隐式归给某个目标。 */
    capture(sessionId: string, event: ProgressEvent): Promise<void>;
    /** 模型必须在当前已绑定回合报告；证据须来自该回合，不能借用别的任务或历史产物。 */
    report(sessionId: string, input: unknown, events: readonly ProgressEvent[]): Promise<string>;
    /** UI 操作必须真正停止关联排程；操作失败时保留原状态并显示错误。 */
    control(idea: Idea, action: string): Promise<void>;
    /** 真实 catalog 是跟踪状态依据；丢失任务明确报错，不自动重复补建。 */
    reconcile(): Promise<void>;
    /** 唯一标记写入真实排程，可在写后崩溃时通过 catalog 找回，避免重复创建。 */
    private ensureSchedule;
    private catalog;
    private stop;
    private activity;
}
/** 给执行 Agent 的一致约定：开始已包含必要跟进，结构化报告更新同一目标。 */
export declare function trackingInstruction(idea: Idea): string;

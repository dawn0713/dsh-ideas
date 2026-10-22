/** 完成反馈先持久化再发送；失败可重试，重启只续传尚未处理的反馈。 */
import type { IdeaStore } from "./store.js";
import type { Idea } from "./types.js";
export type GoalReference = NonNullable<Idea["goalRef"]>;
export interface GoalFeedbackServices {
    completeGoalTask?(reference: GoalReference): Promise<void>;
}
/** 通过 Goals 的正式服务校验归属和更新步骤，不直接修改目标数据文件。 */
export interface GoalsWriter {
    get(request: {
        goalId: string;
    }): Promise<{
        tasks: readonly {
            id: string;
            status: string;
        }[];
    } | null>;
    updateTask(request: {
        taskId: string;
        status: "done";
    }): Promise<{
        id: string;
        status: string;
    }>;
}
export declare function completeGoalTask(service: GoalsWriter | undefined, reference: GoalReference): Promise<void>;
/** 仅新发生的完成事件进入队列，不将旧版历史完成记录批量回写。 */
export declare function queueGoalFeedback(idea: Idea): void;
export declare class GoalFeedback {
    private readonly store;
    private readonly services;
    constructor(store: IdeaStore, services: GoalFeedbackServices);
    send(id: string): Promise<Idea["goalSync"]>;
    recover(): Promise<void>;
}

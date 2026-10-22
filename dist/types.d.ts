/** Ideas 的文件、模型输出和浏览器 RPC 共享数据契约。 */
export declare const START_TEXT = "\u6211\u4EEC\u5F00\u59CB\u5427\uFF01";
export declare const HANDOFF_SOURCE = "personal-ideas-context";
export type IdeaStatus = "suggested" | "adopted" | "started" | "completed" | "dismissed";
/** 目标、单轮运行和排程分开记录，回合结束不等于目标达成。 */
export interface IdeaProgress {
    lifecycle: "active" | "paused" | "completed" | "stopped";
    run: "queued" | "running" | "waiting_input" | "waiting_approval" | "waiting_external" | "review" | "failed" | "interrupted" | "tracking";
    summary: string;
    nextStep: string;
    mode: "once" | "ongoing" | "mixed";
    completionRule: string;
    turn?: number;
    lastSeq: number;
    lastVerifiedAt?: string;
    requests: string[];
    pendingFollowup?: {
        requestId: string;
        note: string;
    };
    artifacts: {
        path: string;
        seq: number;
        at: string;
    }[];
    activity: {
        at: string;
        summary: string;
        source: string;
        seq?: number;
    }[];
    followUp: {
        state: "off" | "active" | "paused" | "ended" | "error";
        ids: string[];
        rule?: {
            cron?: string;
            at?: string;
            until?: string;
        };
        nextAt?: string;
        error?: string;
    };
}
export interface IdeaDraft {
    /** 依据来源由宿主引用校验后确定，与手动／自动生成方式分开记录。 */
    basis?: "memory" | "goal";
    goalRef?: {
        goalId: string;
        taskId: string;
        title: string;
    };
    title: string;
    description: string;
    reason: string;
    instruction: string;
    evidenceIds: number[];
    goal?: string;
    intent?: string;
    value?: number;
    includes?: {
        title: string;
        description: string;
    }[];
    howItWorks?: string;
}
export interface Idea extends IdeaDraft {
    id: string;
    status: IdeaStatus;
    revision: number;
    createdAt: string;
    updatedAt: string;
    query: string;
    provider: string;
    model: string;
    evidence: string[];
    history: {
        at: string;
        action: string;
        note?: string;
    }[];
    execution?: {
        sessionId: string;
        requestId: string;
        state: "pending" | "accepted";
        handoffVersion?: 1;
        title?: string;
        context?: string;
    };
    completion?: {
        at: string;
        note: string;
    };
    /** 关联步骤的完成回写独立记录，避免把 Ideas 完成误报为 Goals 已同步。 */
    goalSync?: {
        state: "pending" | "synced" | "error";
        at?: string;
        error?: string;
    };
    progress?: IdeaProgress;
    source?: "automatic" | "manual" | "general";
    /** 同批次顺序保证三张卡交错展示；来源不足提示随推荐一起持久化。 */
    batchId?: string;
    batchOrder?: number;
    sourceNote?: string;
    templateId?: string;
    expiresAt?: string;
    archivedAt?: string;
    feedback?: {
        at: string;
        kind: "adjust" | "dismiss";
        note: string;
    }[];
}
/** 只在外部边界验证对象，避免模型、磁盘或 RPC 的非法数据进入界面。 */
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isIdeaDraft(value: unknown, allowEmptyEvidence?: boolean): value is IdeaDraft;
export declare function isIdea(value: unknown): value is Idea;

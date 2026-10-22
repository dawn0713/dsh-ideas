import { type Idea, type IdeaDraft } from "./types.js";
export declare class IdeaStore {
    readonly directory: string;
    private queue;
    constructor(directory: string);
    /** 写入失败不阻断后续操作；所有读写通过同一队列获取一致的文件状态。 */
    transaction<T>(operation: () => Promise<T>): Promise<T>;
    list(): Promise<Idea[]>;
    read(id: string): Promise<Idea>;
    save(idea: Idea): Promise<void>;
    /** 持久化版本号用于拒绝另一页面基于旧数据发出的修改。 */
    checkRevision(idea: Idea, revision: number): void;
    /** 调度状态也使用 Markdown 前言保存；文件缺失表示第一次启动，不覆盖损坏的已有文件。 */
    readEngine(): Promise<unknown>;
    /** 与推荐共用写入队列，原子保存配额与上下文，防止重启绕过调用间隔。 */
    saveEngine(state: unknown): Promise<void>;
    private path;
}
/** 统一初始化推荐和时间信息，避免模型提供的 ID 或状态控制本地文件。 */
export declare function createIdea(draft: IdeaDraft, context: Pick<Idea, "query" | "provider" | "model">, evidence: string[]): Idea;

/** 双来源推荐：读取目标步骤、保持来源均衡，并保留可追溯的真实依据。 */
import { type Idea, type IdeaDraft } from "./types.js";
export interface GoalEvidence {
    text: string;
    goalId: string;
    goalTitle: string;
    taskId: string;
    title: string;
}
/** overview 包含所有生命周期的目标；这里只使用进行中或受阻目标的未完成步骤。 */
export declare function goalEvidence(value: unknown, maximum: number): GoalEvidence[];
/** 只截取完整证据；不截断目标 JSON，不让超长记忆挤掉目标来源。 */
export declare function boundMemory(items: string[], maximum: number): string[];
/** 来源由真实引用推导，模型不能自行声称来自某目标或伪造步骤编号。 */
export declare function attributeDraft(draft: IdeaDraft, memoryCount: number, goals: GoalEvidence[]): IdeaDraft;
/** 奇数槽位优先给历史占比较少的一方；记录已持久化，重启后不会重置轮换。 */
export declare function preferredBasis(history: Idea[]): "memory" | "goal";
/** 生成、卡池和首页共用来源轮选，避免最高分或最新排序将另一来源全部挤掉。 */
export declare function balancedIdeas<T extends {
    basis?: "memory" | "goal";
}>(items: T[], count: number, first?: "memory" | "goal"): T[];
/** 同批次按已确定的交错次序展示，跨批次仍优先最新推荐。 */
export declare function newestIdeas(a: Idea, b: Idea): number;

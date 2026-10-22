/** 双来源推荐：读取目标步骤、保持来源均衡，并保留可追溯的真实依据。 */
import { isRecord, type Idea, type IdeaDraft } from "./types.js";

export interface GoalEvidence {
  text: string; goalId: string; goalTitle: string; taskId: string; title: string;
}

/** overview 包含所有生命周期的目标；这里只使用进行中或受阻目标的未完成步骤。 */
export function goalEvidence(value: unknown, maximum: number): GoalEvidence[] {
  if (!isRecord(value) || !Array.isArray(value.goals) || !Array.isArray(value.openTasks))
    throw new Error("个人目标接口返回格式无效。");
  const result: GoalEvidence[] = [];
  let remaining = maximum;
  for (const summary of value.openTasks) {
    if (!isRecord(summary) || !["active", "blocked"].includes(String(summary.goalStatus))
      || !["pending", "in_progress", "blocked"].includes(String(summary.status))) continue;
    const goal = value.goals.find(item => isRecord(item) && item.id === summary.goalId);
    if (!isRecord(goal) || !["active", "blocked"].includes(String(goal.status)) || !Array.isArray(goal.tasks)) continue;
    const task = goal.tasks.find(item => isRecord(item) && item.id === summary.taskId);
    if (!isRecord(task) || !["pending", "in_progress", "blocked"].includes(String(task.status))
      || typeof goal.id !== "string" || typeof goal.title !== "string" || typeof task.id !== "string" || typeof task.title !== "string") continue;
    const tasks = goal.tasks.filter(item => isRecord(item) && item.status !== "cancelled");
    // 完成比例按有效步骤计算，取消步骤不计入分母；备注和完成标准只作为事实材料。
    const text = JSON.stringify({ goalId: goal.id, goalTitle: goal.title, goalStatus: goal.status,
      doneCriteria: typeof goal.doneCriteria === "string" ? goal.doneCriteria.slice(0, 1000) : undefined,
      progress: { completed: tasks.filter(item => isRecord(item) && item.status === "done").length, total: tasks.length },
      taskId: task.id, title: task.title, status: task.status, dueAt: task.dueAt,
      notes: typeof task.notes === "string" ? task.notes.slice(0, 1200) : undefined });
    if (text.length > remaining) continue;
    result.push({ text, goalId: goal.id, goalTitle: goal.title, taskId: task.id, title: task.title });
    remaining -= text.length;
  }
  return result;
}

/** 只截取完整证据；不截断目标 JSON，不让超长记忆挤掉目标来源。 */
export function boundMemory(items: string[], maximum: number): string[] {
  const result: string[] = [];
  for (const item of items) {
    if (maximum <= 0) break;
    result.push(item.slice(0, maximum));
    maximum -= result.at(-1)!.length;
  }
  return result;
}

/** 来源由真实引用推导，模型不能自行声称来自某目标或伪造步骤编号。 */
export function attributeDraft(draft: IdeaDraft, memoryCount: number, goals: GoalEvidence[]): IdeaDraft {
  const goal = draft.evidenceIds.map(id => goals[id - memoryCount - 1]).find(Boolean);
  return goal ? { ...draft, basis: "goal", goal: goal.goalTitle,
    goalRef: { goalId: goal.goalId, taskId: goal.taskId, title: goal.title } }
    : { ...draft, basis: "memory" };
}

/** 奇数槽位优先给历史占比较少的一方；记录已持久化，重启后不会重置轮换。 */
export function preferredBasis(history: Idea[]): "memory" | "goal" {
  const generated = history.filter(item => item.basis && item.source !== "general");
  return generated.filter(item => item.basis === "memory").length > generated.filter(item => item.basis === "goal").length
    ? "goal" : "memory";
}

/** 生成、卡池和首页共用来源轮选，避免最高分或最新排序将另一来源全部挤掉。 */
export function balancedIdeas<T extends { basis?: "memory" | "goal" }>(items: T[], count: number,
  first: "memory" | "goal" = items[0]?.basis ?? "memory"): T[] {
  const groups = { memory: items.filter(item => item.basis !== "goal"), goal: items.filter(item => item.basis === "goal") };
  const result: T[] = [];
  let next = first;
  while (result.length < count && (groups.memory.length || groups.goal.length)) {
    const item = groups[next].shift() ?? groups[next === "memory" ? "goal" : "memory"].shift();
    if (item) result.push(item);
    next = next === "memory" ? "goal" : "memory";
  }
  return result;
}

/** 同批次按已确定的交错次序展示，跨批次仍优先最新推荐。 */
export function newestIdeas(a: Idea, b: Idea): number {
  return b.createdAt.localeCompare(a.createdAt) || (a.batchOrder ?? 0) - (b.batchOrder ?? 0);
}

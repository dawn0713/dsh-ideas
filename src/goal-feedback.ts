/** 完成反馈先持久化再发送；失败可重试，重启只续传尚未处理的反馈。 */
import type { IdeaStore } from "./store.js";
import type { Idea } from "./types.js";

export type GoalReference = NonNullable<Idea["goalRef"]>;
export interface GoalFeedbackServices {
  completeGoalTask?(reference: GoalReference): Promise<void>;
}
/** 通过 Goals 的正式服务校验归属和更新步骤，不直接修改目标数据文件。 */
export interface GoalsWriter {
  get(request: { goalId: string }): Promise<{ tasks: readonly { id: string; status: string }[] } | null>;
  updateTask(request: { taskId: string; status: "done" }): Promise<{ id: string; status: string }>;
}
export async function completeGoalTask(service: GoalsWriter | undefined, reference: GoalReference): Promise<void> {
  if (!service) throw new Error("Goals 服务未加载，请启用后重试同步。");
  const goal = await service.get({ goalId: reference.goalId });
  const task = goal?.tasks.find(item => item.id === reference.taskId);
  if (!task) throw new Error("关联目标或步骤已删除，无法同步完成状态。");
  if (task.status === "done") return; // 已完成时不重复写入，也不覆盖用户的备注。
  if (task.status === "cancelled") throw new Error("关联步骤已取消，请先在 Goals 中核对。");
  const updated = await service.updateTask({ taskId: reference.taskId, status: "done" });
  if (updated.id !== reference.taskId || updated.status !== "done") throw new Error("Goals 未确认步骤完成，请重试同步。");
}

/** 仅新发生的完成事件进入队列，不将旧版历史完成记录批量回写。 */
export function queueGoalFeedback(idea: Idea): void {
  if (idea.goalRef && idea.status === "completed" && !idea.goalSync) idea.goalSync = { state: "pending" };
}

export class GoalFeedback {
  constructor(private readonly store: IdeaStore, private readonly services: GoalFeedbackServices) {}
  async send(id: string): Promise<Idea["goalSync"]> {
    return this.store.transaction(async () => {
      const idea = await this.store.read(id);
      if (!idea.goalRef || idea.status !== "completed" || !idea.completion
        || !idea.goalSync || idea.goalSync.state === "synced") return idea.goalSync;
      try {
        if (!this.services.completeGoalTask) throw new Error("Goals 同步服务不可用，请启用后重试。");
        await this.services.completeGoalTask(idea.goalRef);
        idea.goalSync = { state: "synced", at: new Date().toISOString() };
      } catch (error) {
        // 单独保存同步失败，不能丢失已经核验的 Ideas 完成记录。
        idea.goalSync = { state: "error", error: (error instanceof Error ? error.message : String(error)).slice(0, 1000) };
      }
      idea.updatedAt = new Date().toISOString(); idea.revision++;
      await this.store.save(idea);
      return idea.goalSync;
    });
  }
  async recover(): Promise<void> {
    const ideas = await this.store.transaction(() => this.store.list());
    for (const idea of ideas) if (idea.goalSync?.state === "pending") await this.send(idea.id);
  }
}

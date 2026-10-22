export async function completeGoalTask(service, reference) {
    if (!service)
        throw new Error("Goals 服务未加载，请启用后重试同步。");
    const goal = await service.get({ goalId: reference.goalId });
    const task = goal?.tasks.find(item => item.id === reference.taskId);
    if (!task)
        throw new Error("关联目标或步骤已删除，无法同步完成状态。");
    if (task.status === "done")
        return; // 已完成时不重复写入，也不覆盖用户的备注。
    if (task.status === "cancelled")
        throw new Error("关联步骤已取消，请先在 Goals 中核对。");
    const updated = await service.updateTask({ taskId: reference.taskId, status: "done" });
    if (updated.id !== reference.taskId || updated.status !== "done")
        throw new Error("Goals 未确认步骤完成，请重试同步。");
}
/** 仅新发生的完成事件进入队列，不将旧版历史完成记录批量回写。 */
export function queueGoalFeedback(idea) {
    if (idea.goalRef && idea.status === "completed" && !idea.goalSync)
        idea.goalSync = { state: "pending" };
}
export class GoalFeedback {
    store;
    services;
    constructor(store, services) {
        this.store = store;
        this.services = services;
    }
    async send(id) {
        return this.store.transaction(async () => {
            const idea = await this.store.read(id);
            if (!idea.goalRef || idea.status !== "completed" || !idea.completion
                || !idea.goalSync || idea.goalSync.state === "synced")
                return idea.goalSync;
            try {
                if (!this.services.completeGoalTask)
                    throw new Error("Goals 同步服务不可用，请启用后重试。");
                await this.services.completeGoalTask(idea.goalRef);
                idea.goalSync = { state: "synced", at: new Date().toISOString() };
            }
            catch (error) {
                // 单独保存同步失败，不能丢失已经核验的 Ideas 完成记录。
                idea.goalSync = { state: "error", error: (error instanceof Error ? error.message : String(error)).slice(0, 1000) };
            }
            idea.updatedAt = new Date().toISOString();
            idea.revision++;
            await this.store.save(idea);
            return idea.goalSync;
        });
    }
    async recover() {
        const ideas = await this.store.transaction(() => this.store.list());
        for (const idea of ideas)
            if (idea.goalSync?.state === "pending")
                await this.send(idea.id);
    }
}

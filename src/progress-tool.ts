/** 给 Agent 提供受会话和任务回合限制的进度报告工具，工具卡片使用中文。 */
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { Context } from "@deepseek-ai/cordis";
import type { IdeasRuntime } from "./runtime.js";

export function installProgressTool(ctx: Context, runtime: IdeasRuntime): () => void {
  return ctx.tools.register(defineTool({
    name: "ideas_update_progress",
    description: "读取或更新已开始的 Ideas 目标。点击开始已包含必要跟进，勿反复询问是否需要提醒。inspect 返回本轮真实事件序号，普通聊天继续任务时在 evidence_seqs 引用本轮用户消息即可关联。进度回写失败最多修正一次，仍须正常回复用户并交付成果，不能阻塞正文。",
    parameters: {
      idea_id: { type: "string", required: true, description: "当前任务上下文中的 Idea ID。" },
      state: { type: "string", required: true, enum: ["inspect", "running", "waiting_input", "waiting_external", "tracking", "completed"], description: "inspect 读取证据；tracking 直接安排必要跟进；completed 申请按口径核验。" },
      summary: { type: "string", required: true, description: "本轮实际结果或阻塞，不能声称未执行的操作。" },
      next_step: { type: "string", description: "下一步或需要用户集中补充的关键资料。" },
      evidence_seqs: { type: "array", items: { type: "integer" }, description: "inspect 返回的本轮真实证据序号。普通聊天继续本目标时须包含本轮用户消息编号，已有该编号即可关联，无需另填 user_update_seq。" },
      user_update_seq: { type: "integer", description: "可选的本轮用户消息编号，用于显式关联后续更新；evidence_seqs 已包含时无需重复传入。不要把无关聊天当作更新。" },
      completion_kind: { type: "string", enum: ["artifact", "external", "user_update"], description: "一次性构件交付、外部结果或用户明确的整体完成更新。仅一般进展不能用 user_update 声称整体完成。" },
      followup_cron: { type: "string", description: "已有偏好对应的五字段 cron，缺省采用该点子的默认规则。不能与 followup_at 同时指定。" },
      followup_at: { type: "string", description: "一次性检查的 ISO 日期时间，必须包含时区；复用已知目标日期。" },
      followup_until: { type: "string", description: "计划/出行/价保等目标的跟进截止时间，必须包含时区。" },
    },
    async execute(args, exec) {
      if (!exec.agent) throw new Error("进度更新需要绑定 DSH 会话。");
      return runtime.tracker.report(exec.agent.id, args, exec.agent.session.snapshotEvents());
    },
    output: { schema: { type: "string" }, render: (_args, value) => [{ type: "text", text: value }] },
    presentCall: args => ({ card: "generic", kind: "edit", title: "更新点子进度", rawInput: args }),
  }));
}

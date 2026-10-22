/** Ideas 的文件、模型输出和浏览器 RPC 共享数据契约。 */
export const START_TEXT = "我们开始吧！";
export const HANDOFF_SOURCE = "personal-ideas-context";
export type IdeaStatus = "suggested" | "adopted" | "started" | "completed" | "dismissed";
/** 目标、单轮运行和排程分开记录，回合结束不等于目标达成。 */
export interface IdeaProgress {
  lifecycle: "active" | "paused" | "completed" | "stopped";
  run: "queued" | "running" | "waiting_input" | "waiting_approval" | "waiting_external" | "review" | "failed" | "interrupted" | "tracking";
  summary: string; nextStep: string; mode: "once" | "ongoing" | "mixed"; completionRule: string;
  turn?: number; lastSeq: number; lastVerifiedAt?: string;
  requests: string[];
  pendingFollowup?: { requestId: string; note: string };
  artifacts: { path: string; seq: number; at: string }[];
  activity: { at: string; summary: string; source: string; seq?: number }[];
  followUp: { state: "off" | "active" | "paused" | "ended" | "error"; ids: string[];
    rule?: { cron?: string; at?: string; until?: string }; nextAt?: string; error?: string };
}
export interface IdeaDraft {
  /** 依据来源由宿主引用校验后确定，与手动／自动生成方式分开记录。 */
  basis?: "memory" | "goal";
  goalRef?: { goalId: string; taskId: string; title: string };
  title: string;
  description: string;
  reason: string;
  instruction: string;
  evidenceIds: number[];
  goal?: string;
  intent?: string;
  value?: number;
  includes?: { title: string; description: string }[];
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
  history: { at: string; action: string; note?: string }[];
  execution?: { sessionId: string; requestId: string; state: "pending" | "accepted";
    handoffVersion?: 1; title?: string; context?: string };
  completion?: { at: string; note: string };
  /** 关联步骤的完成回写独立记录，避免把 Ideas 完成误报为 Goals 已同步。 */
  goalSync?: { state: "pending" | "synced" | "error"; at?: string; error?: string };
  progress?: IdeaProgress;
  source?: "automatic" | "manual" | "general";
  /** 同批次顺序保证三张卡交错展示；来源不足提示随推荐一起持久化。 */
  batchId?: string;
  batchOrder?: number;
  sourceNote?: string;
  templateId?: string;
  expiresAt?: string;
  archivedAt?: string;
  feedback?: { at: string; kind: "adjust" | "dismiss"; note: string }[];
}

/** 只在外部边界验证对象，避免模型、磁盘或 RPC 的非法数据进入界面。 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isIdeaDraft(value: unknown, allowEmptyEvidence = false): value is IdeaDraft {
  return isRecord(value) && ["title", "description", "reason", "instruction"].every(
    key => typeof value[key] === "string" && value[key].trim().length > 0 && value[key].length <= 8000,
  ) && typeof value.title === "string" && value.title.length <= 160
    && Array.isArray(value.evidenceIds) && (allowEmptyEvidence || value.evidenceIds.length > 0)
    && value.evidenceIds.every(id => Number.isInteger(id) && id > 0)
    && (value.basis === undefined || ["memory", "goal"].includes(String(value.basis)))
    && (value.goalRef === undefined || (isRecord(value.goalRef) && ["goalId", "taskId", "title"].every(
      key => typeof (value.goalRef as Record<string, unknown>)[key] === "string"
        && String((value.goalRef as Record<string, unknown>)[key]).trim().length > 0)))
    && ["goal", "intent"].every(key => value[key] === undefined || (typeof value[key] === "string" && value[key].length <= 500))
    && (value.value === undefined || (Number.isInteger(value.value) && Number(value.value) >= 1 && Number(value.value) <= 5))
    && (value.howItWorks === undefined || (typeof value.howItWorks === "string" && value.howItWorks.length <= 2000))
    && (value.includes === undefined || (Array.isArray(value.includes) && value.includes.length >= 1 && value.includes.length <= 4
      && value.includes.every(item => isRecord(item) && typeof item.title === "string" && item.title.trim().length > 0 && item.title.length <= 160
        && typeof item.description === "string" && item.description.length <= 500)));
}
export function isIdea(value: unknown): value is Idea {
  if (!isRecord(value) || !isIdeaDraft(value, value.source === "general")) return false;
  return typeof value.id === "string" && /^[a-f\d-]{36}$/.test(value.id)
    && ["suggested", "adopted", "started", "completed", "dismissed"].includes(String(value.status))
    && Number.isInteger(value.revision) && Number(value.revision) > 0
    && ["createdAt", "updatedAt", "query", "provider", "model"].every(key => typeof value[key] === "string")
    && Array.isArray(value.evidence) && value.evidence.every(item => typeof item === "string")
    && Array.isArray(value.history) && value.history.every(item => isRecord(item)
      && typeof item.at === "string" && typeof item.action === "string"
      && (item.note === undefined || typeof item.note === "string"))
    && (value.execution === undefined || (isRecord(value.execution)
      && typeof value.execution.sessionId === "string" && typeof value.execution.requestId === "string"
      && ["pending", "accepted"].includes(String(value.execution.state))
      && (value.execution.handoffVersion === undefined || (value.execution.handoffVersion === 1
        && typeof value.execution.title === "string" && value.execution.title.length <= 160
        && typeof value.execution.context === "string" && value.execution.context.length > 0 && value.execution.context.length <= 64000))))
    && (value.completion === undefined || (isRecord(value.completion)
      && typeof value.completion.at === "string" && typeof value.completion.note === "string"))
    && (value.goalSync === undefined || (isRecord(value.goalSync)
      && ["pending", "synced", "error"].includes(String(value.goalSync.state))
      && (value.goalSync.at === undefined || typeof value.goalSync.at === "string")
      && (value.goalSync.error === undefined || typeof value.goalSync.error === "string")))
    && (value.progress === undefined || isProgress(value.progress))
    && (value.source === undefined || ["automatic", "manual", "general"].includes(String(value.source)))
    && (value.batchId === undefined || typeof value.batchId === "string")
    && (value.batchOrder === undefined || (Number.isInteger(value.batchOrder) && Number(value.batchOrder) >= 0))
    && (value.sourceNote === undefined || typeof value.sourceNote === "string")
    // 通用任务没有个人记忆依据；只有带固定目录编号的通用记录允许空证据。
    && (value.source !== "general" || (typeof value.templateId === "string" && /^general-\d{2}$/.test(value.templateId)
      && value.evidenceIds.length === 0 && value.evidence.length === 0))
    && ["expiresAt", "archivedAt"].every(key => value[key] === undefined || (typeof value[key] === "string" && Number.isFinite(Date.parse(value[key]))))
    && (value.feedback === undefined || (Array.isArray(value.feedback) && value.feedback.every(item => isRecord(item)
      && typeof item.at === "string" && ["adjust", "dismiss"].includes(String(item.kind)) && typeof item.note === "string" && item.note.length <= 2000)));
}

/** 对磁盘及 RPC 中新增的进度字段执行完整验证，旧记录仍可读取。 */
function isProgress(p: unknown): p is IdeaProgress {
  if (!isRecord(p) || !["active", "paused", "completed", "stopped"].includes(String(p.lifecycle))
    || !["queued", "running", "waiting_input", "waiting_approval", "waiting_external", "review", "failed", "interrupted", "tracking"].includes(String(p.run))
    || !["once", "ongoing", "mixed"].includes(String(p.mode)) || typeof p.summary !== "string" || typeof p.nextStep !== "string"
    || typeof p.completionRule !== "string" || !Number.isInteger(p.lastSeq) || Number(p.lastSeq) < -1
    || (p.turn !== undefined && !Number.isInteger(p.turn))
    || !Array.isArray(p.requests) || !p.requests.every(id => typeof id === "string")
    || (p.pendingFollowup !== undefined && (!isRecord(p.pendingFollowup) || typeof p.pendingFollowup.requestId !== "string" || typeof p.pendingFollowup.note !== "string"))
    || !Array.isArray(p.artifacts) || !p.artifacts.every(a => isRecord(a) && typeof a.path === "string" && Number.isInteger(a.seq) && typeof a.at === "string")
    || !Array.isArray(p.activity) || !p.activity.every(a => isRecord(a) && typeof a.at === "string" && typeof a.summary === "string"
      && typeof a.source === "string" && (a.seq === undefined || Number.isInteger(a.seq)))) return false;
  const f = p.followUp;
  const rule = isRecord(f) ? f.rule : undefined;
  return isRecord(f) && ["off", "active", "paused", "ended", "error"].includes(String(f.state))
    && Array.isArray(f.ids) && f.ids.every(id => typeof id === "string")
    && ["nextAt", "error"].every(key => f[key] === undefined || typeof f[key] === "string")
    && (p.lastVerifiedAt === undefined || typeof p.lastVerifiedAt === "string")
    && (rule === undefined || (isRecord(rule) && ["cron", "at", "until"].every(key => rule[key] === undefined || typeof rule[key] === "string")));
}

/** 目标页展示实际进度、来源、构件和真实排程；操作结果由宿主核实后刷新。 */
import { useState } from "react";
import type { Idea } from "../types.js";
import type { IdeasApi } from "./api.js";
import type { Translate } from "./locales.js";

/** 在概览和详情展示真实同步结果；失败重试不重复执行已完成的任务。 */
export function GoalSyncStatus({ idea, api, t }: { idea: Idea; api: IdeasApi; t: Translate }) {
  if (!idea.goalSync) return null;
  const sync = idea.goalSync;
  return <div className="pai-ideas-goal-sync" role={sync.state === "error" ? "alert" : "status"}>
    <p>{t(sync.state === "synced" ? "goalSynced" : sync.state === "error" ? "goalSyncError" : "goalSyncPending")}</p>
    {sync.error && <small>{sync.error}</small>}
    {sync.state !== "synced" && <button type="button" disabled={api.getSnapshot().busy}
      onClick={() => void api.run("update", { id: idea.id, revision: idea.revision, action: "syncGoal" })}>{t("retryGoalSync")}</button>}
  </div>;
}

export function ProgressPanel({ idea, api, t }: { idea: Idea; api: IdeasApi; t: Translate }) {
  const [note, setNote] = useState(idea.progress?.pendingFollowup?.note ?? "");
  const p = idea.progress, busy = api.getSnapshot().busy;
  const update = (action: string) => api.run("update", { id: idea.id, revision: idea.revision, action,
    ...(action === "complete" ? { note: note.trim() } : {}) });
  if (!idea.execution) return null;
  return <section className="pai-ideas-progress" aria-label={t("progressTitle")}>
    <h3>{t("progressTitle")}</h3><strong className="pai-ideas-progress-state">{progressLabel(idea, t)}</strong>
    <p>{p?.summary || t("legacyProgress")}</p>
    <GoalSyncStatus idea={idea} api={api} t={t} />
    {p?.nextStep && <p><strong>{t("nextStep")}：</strong>{p.nextStep}</p>}
    <div className="pai-ideas-progress-box"><strong>{t("completionRule")}</strong><p>{p?.completionRule || idea.instruction}</p>
      <small>{t("completionHint")}</small></div>
    <div className="pai-ideas-progress-box"><strong>{t("followupTitle")}</strong>
      <p>{p ? t(`followup_${p.followUp.state}`) : t("legacyProgress")}</p>
      {p?.followUp.nextAt && <p>{t("nextCheck")}：{date(p.followUp.nextAt)}</p>}
      {p?.followUp.ids.map(id => <small key={id}>{t("scheduleId")}：{id}</small>)}
      {p?.followUp.error && <p role="alert" className="pai-ideas-error">{p.followUp.error}</p>}
      <small>{t("hostRequired")}</small></div>
    {!!p?.artifacts.length && <div className="pai-ideas-progress-box"><strong>{t("artifacts")}</strong><ul>
      {p.artifacts.map(a => <li key={`${a.seq}:${a.path}`}><code>{a.path}</code><small>{date(a.at)} · {t("presentedSource")} #{a.seq}</small></li>)}
    </ul></div>}
    {p?.lastVerifiedAt && <small>{t("lastVerified")}：{date(p.lastVerifiedAt)}</small>}
    <div className="pai-ideas-card-actions">
      <button type="button" onClick={() => api.openConversation(idea.execution!.sessionId)}>{t("viewConversation")}</button>
      {idea.status === "started" && p?.lifecycle !== "stopped" && <>
        <button type="button" disabled={busy} onClick={() => void update(p?.lifecycle === "paused" ? "resume" : "pause")}>{t(p?.lifecycle === "paused" ? "resumeTracking" : "pauseTracking")}</button>
        <button type="button" disabled={busy} onClick={() => void update("stop")}>{t("stopTracking")}</button>
      </>}
    </div>
    {idea.status === "started" && <form className="pai-ideas-finish" onSubmit={event => {
      event.preventDefault(); void api.run("followup", { id: idea.id, revision: idea.revision, note }).then(ok => { if (ok) setNote(""); });
    }}><label>{t("progressNote")}<textarea value={note} maxLength={4000} onChange={event => setNote(event.target.value)} /></label>
      <button type="submit" disabled={busy || !note.trim() || p?.lifecycle !== "active"}>{t("sendProgress")}</button>
      <button type="button" disabled={busy || !note.trim()} onClick={() => void update("complete")}>{t("completeWithNote")}</button>
    </form>}
    {!!p?.activity.length && <details className="pai-ideas-details" open><summary>{t("recentActivity")}</summary><ol>
      {p.activity.slice(-12).reverse().map((a, i) => <li key={`${a.at}:${i}`}>{a.summary}<small>{date(a.at)} · {a.source}{a.seq === undefined ? "" : ` #${a.seq}`}</small></li>)}
    </ol></details>}
  </section>;
}
/** 概览和详情使用相同状态口径，旧版交接记录不会显示成执行成功。 */
export function progressLabel(idea: Idea, t: Translate): string {
  if (idea.status === "completed") return t("completed");
  const p = idea.progress;
  if (!p) return t(idea.status);
  if (p.lifecycle === "paused") return t("pausedGoal");
  if (p.lifecycle === "stopped") return t("stoppedGoal");
  return t(`run_${p.run}`);
}
function date(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** 目标页展示实际进度、来源、构件和真实排程；操作结果由宿主核实后刷新。 */
import { useState } from "react";
/** 在概览和详情展示真实同步结果；失败重试不重复执行已完成的任务。 */
export function GoalSyncStatus({ idea, api, t }) {
    if (!idea.goalSync)
        return null;
    const sync = idea.goalSync;
    return _jsxs("div", { className: "pai-ideas-goal-sync", role: sync.state === "error" ? "alert" : "status", children: [_jsx("p", { children: t(sync.state === "synced" ? "goalSynced" : sync.state === "error" ? "goalSyncError" : "goalSyncPending") }), sync.error && _jsx("small", { children: sync.error }), sync.state !== "synced" && _jsx("button", { type: "button", disabled: api.getSnapshot().busy, onClick: () => void api.run("update", { id: idea.id, revision: idea.revision, action: "syncGoal" }), children: t("retryGoalSync") })] });
}
export function ProgressPanel({ idea, api, t }) {
    const [note, setNote] = useState(idea.progress?.pendingFollowup?.note ?? "");
    const p = idea.progress, busy = api.getSnapshot().busy;
    const update = (action) => api.run("update", { id: idea.id, revision: idea.revision, action,
        ...(action === "complete" ? { note: note.trim() } : {}) });
    if (!idea.execution)
        return null;
    return _jsxs("section", { className: "pai-ideas-progress", "aria-label": t("progressTitle"), children: [_jsx("h3", { children: t("progressTitle") }), _jsx("strong", { className: "pai-ideas-progress-state", children: progressLabel(idea, t) }), _jsx("p", { children: p?.summary || t("legacyProgress") }), _jsx(GoalSyncStatus, { idea: idea, api: api, t: t }), p?.nextStep && _jsxs("p", { children: [_jsxs("strong", { children: [t("nextStep"), "\uFF1A"] }), p.nextStep] }), _jsxs("div", { className: "pai-ideas-progress-box", children: [_jsx("strong", { children: t("completionRule") }), _jsx("p", { children: p?.completionRule || idea.instruction }), _jsx("small", { children: t("completionHint") })] }), _jsxs("div", { className: "pai-ideas-progress-box", children: [_jsx("strong", { children: t("followupTitle") }), _jsx("p", { children: p ? t(`followup_${p.followUp.state}`) : t("legacyProgress") }), p?.followUp.nextAt && _jsxs("p", { children: [t("nextCheck"), "\uFF1A", date(p.followUp.nextAt)] }), p?.followUp.ids.map(id => _jsxs("small", { children: [t("scheduleId"), "\uFF1A", id] }, id)), p?.followUp.error && _jsx("p", { role: "alert", className: "pai-ideas-error", children: p.followUp.error }), _jsx("small", { children: t("hostRequired") })] }), !!p?.artifacts.length && _jsxs("div", { className: "pai-ideas-progress-box", children: [_jsx("strong", { children: t("artifacts") }), _jsx("ul", { children: p.artifacts.map(a => _jsxs("li", { children: [_jsx("code", { children: a.path }), _jsxs("small", { children: [date(a.at), " \u00B7 ", t("presentedSource"), " #", a.seq] })] }, `${a.seq}:${a.path}`)) })] }), p?.lastVerifiedAt && _jsxs("small", { children: [t("lastVerified"), "\uFF1A", date(p.lastVerifiedAt)] }), _jsxs("div", { className: "pai-ideas-card-actions", children: [_jsx("button", { type: "button", onClick: () => api.openConversation(idea.execution.sessionId), children: t("viewConversation") }), idea.status === "started" && p?.lifecycle !== "stopped" && _jsxs(_Fragment, { children: [_jsx("button", { type: "button", disabled: busy, onClick: () => void update(p?.lifecycle === "paused" ? "resume" : "pause"), children: t(p?.lifecycle === "paused" ? "resumeTracking" : "pauseTracking") }), _jsx("button", { type: "button", disabled: busy, onClick: () => void update("stop"), children: t("stopTracking") })] })] }), idea.status === "started" && _jsxs("form", { className: "pai-ideas-finish", onSubmit: event => {
                    event.preventDefault();
                    void api.run("followup", { id: idea.id, revision: idea.revision, note }).then(ok => { if (ok)
                        setNote(""); });
                }, children: [_jsxs("label", { children: [t("progressNote"), _jsx("textarea", { value: note, maxLength: 4000, onChange: event => setNote(event.target.value) })] }), _jsx("button", { type: "submit", disabled: busy || !note.trim() || p?.lifecycle !== "active", children: t("sendProgress") }), _jsx("button", { type: "button", disabled: busy || !note.trim(), onClick: () => void update("complete"), children: t("completeWithNote") })] }), !!p?.activity.length && _jsxs("details", { className: "pai-ideas-details", open: true, children: [_jsx("summary", { children: t("recentActivity") }), _jsx("ol", { children: p.activity.slice(-12).reverse().map((a, i) => _jsxs("li", { children: [a.summary, _jsxs("small", { children: [date(a.at), " \u00B7 ", a.source, a.seq === undefined ? "" : ` #${a.seq}`] })] }, `${a.at}:${i}`)) })] })] });
}
/** 概览和详情使用相同状态口径，旧版交接记录不会显示成执行成功。 */
export function progressLabel(idea, t) {
    if (idea.status === "completed")
        return t("completed");
    const p = idea.progress;
    if (!p)
        return t(idea.status);
    if (p.lifecycle === "paused")
        return t("pausedGoal");
    if (p.lifecycle === "stopped")
        return t("stoppedGoal");
    return t(`run_${p.run}`);
}
function date(value) {
    return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

/** 推荐卡片优先展示；后台生成与用户操作分离，选择卡片后交给主聊天栏。 */
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Idea } from "../types.js";
import type { IdeasApi } from "./api.js";
import type { Translate } from "./locales.js";
import { GENERAL_IDEAS } from "../catalog.js";
import { GoalSyncStatus, ProgressPanel, progressLabel } from "./progress.js";
import { GeneralCatalog, GeneralDetail } from "./general.js";
import { balancedIdeas, newestIdeas } from "../recommendations.js";

export interface PanelProps {
  api: IdeasApi; t: Translate; sessionId?: string; sessionLabel?: string; compact?: boolean;
  onOpen?: () => void; onBack?: () => void;
}
export function IdeasPanel({ api, t, sessionId, sessionLabel, compact, onOpen, onBack }: PanelProps) {
  const state = useSyncExternalStore(api.subscribe, api.getSnapshot);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [selectedId, setSelectedId] = useState<string>();
  const [generalId, setGeneralId] = useState<string>();
  useEffect(() => { void api.refresh(); }, [api]);
  // 首页取最新候选并按来源交错，确保两方有候选时三条中都有记忆与目标。
  const items = state.ideas.filter(idea => filter === "all"
    || (filter === "inProgress" ? idea.status === "started" && idea.progress?.lifecycle !== "stopped"
      : filter === "active" ? idea.source !== "general" && ["suggested", "adopted"].includes(idea.status) && !idea.archivedAt
      : idea.status === filter))
    .sort(newestIdeas);
  const shown = filter === "active" ? balancedIdeas(items, 3) : items;
  const selected = state.ideas.find(idea => idea.id === selectedId);
  const general = GENERAL_IDEAS.find(item => item.id === generalId);
  if (general) return <section className={`pai-ideas pai-ideas-detail-root${compact ? " pai-ideas-compact" : ""}`}>
    <GeneralDetail item={general} api={api} t={t} sessionId={sessionId} onClose={() => setGeneralId(undefined)} />
  </section>;
  if (selected) return <section className={`pai-ideas pai-ideas-detail-root${compact ? " pai-ideas-compact" : ""}`}>
    <IdeaCard idea={selected} api={api} t={t} sessionId={sessionId} disabled={state.busy} index={0} detail
      error={state.error} onSelect={() => {}} onClose={() => setSelectedId(undefined)} />
  </section>;
  return <section className={`pai-ideas${compact ? " pai-ideas-compact" : ""}`}>
    <header className="pai-ideas-heading">
      <div><span className="pai-ideas-eyebrow">PERSONAL AI</span><h1><Bulb size={27} />{t("title")}</h1>
        <p>{t(compact ? "compactSubtitle" : "subtitle")}</p></div>
      <div className="pai-ideas-heading-actions">
        {onOpen && <button type="button" onClick={onOpen}>{t("open")} ↗</button>}
        {onBack && <button type="button" onClick={onBack}>{t("back")} →</button>}
      </div>
    </header>
    <div className="pai-ideas-engine" role="status"><span><i className={state.generating ? "working" : ""} />
      {t(state.generating ? "backgroundWorking" : state.engine.enabled ? "backgroundReady" : "backgroundOff")}</span>
      {state.engine.lastUpdatedAt && <time>{t("lastUpdated")} · {formatDate(state.engine.lastUpdatedAt)}</time>}
      {state.engine.enabled && state.engine.nextAttemptAt && <time>{t("nextUpdate")} · {formatDate(state.engine.nextAttemptAt)}</time>}</div>
    {state.engine.lastError && <p className="pai-ideas-background-error">{t("backgroundFailed")}</p>}
    {state.sourceNotice && <p className="pai-ideas-notice" role="status">{state.sourceNotice}</p>}
    {state.error && <div className="pai-ideas-error" role="alert">{t("error")}：{state.error}</div>}
    {state.notice && <div className="pai-ideas-notice" role="status">{t(state.notice)}</div>}
    <div className="pai-ideas-toolbar"><div className="pai-ideas-filters">
      {(["active", "inProgress", "completed", "dismissed", "all"] as const).map(key => <button type="button" key={key}
        aria-pressed={filter === key} onClick={() => setFilter(key)}>{t(key)}</button>)}
      </div><button type="button" onClick={() => { void api.refresh(); }}>{t("refresh")}</button></div>
    <div className="pai-ideas-grid" aria-busy={state.busy}>
      {shown.map((idea, index) => <IdeaCard key={idea.id} {...{ idea, api, t, sessionId, disabled: state.busy, index }} onSelect={() => setSelectedId(idea.id)} />)}
    </div>
    {state.loading ? <div className="pai-ideas-empty" role="status">{t("loading")}</div>
      : !shown.length && <div className="pai-ideas-empty"><Bulb size={36} /><h2>{t(state.ideas.length ? "noMatch" : "empty")}</h2>
        {!state.ideas.length && <p>{t(state.engine.enabled ? "emptyHint" : "manualHint")}</p>}</div>}
    {filter === "active" && <GeneralCatalog t={t} onSelect={setGeneralId} />}
    <details className="pai-ideas-compose"><summary>{t("customGenerate")}</summary>
      <label htmlFor={compact ? "pai-topic-side" : "pai-topic-main"}>{t("topic")}</label>
      <div><input id={compact ? "pai-topic-side" : "pai-topic-main"} placeholder={t("placeholder")} value={query}
        maxLength={2000} onChange={event => setQuery(event.target.value)} />
        <button type="button" className="pai-ideas-primary" disabled={state.generating} onClick={() => {
          void api.run("generate", { query }).then(ok => { if (ok) { setFilter("active"); } });
        }}>{state.generating ? t("generating") : t("generate")}</button></div>
      <small>{t("instructions")}</small>
    </details>
    <footer className="pai-ideas-foot"><span>{state.ideas.length} {t("count")}</span>
      <span>{sessionId ? `${t("target")} · ${sessionLabel || sessionId}` : t("noSession")}</span></footer>
  </section>;
}

/** 先查看建议详情，再明确点击马上开始；菜单和反馈表单不会误触任务交接。 */
function IdeaCard({ idea, api, t, sessionId, disabled, index, detail, error, onSelect, onClose }: {
  idea: Idea; api: IdeasApi; t: Translate; sessionId?: string; disabled: boolean; index: number;
  detail?: boolean; error?: string; onSelect(): void; onClose?: () => void;
}) {
  const [editing, setEditing] = useState<"adjust" | "dismiss" | "complete" | null>(null);
  const [note, setNote] = useState("");
  const pending = idea.execution?.state === "pending";
  const active = ["suggested", "adopted"].includes(idea.status);
  const start = () => { if (!disabled && !editing && active) void api.run("start", { id: idea.id, revision: idea.revision, sessionId }); };
  const update = (action: string) => api.run("update", { id: idea.id, revision: idea.revision, action, note });
  const edit = (action: typeof editing) => { setEditing(action); setNote(""); };
  const eventLabels: Record<string, Parameters<Translate>[0]> = { generated: "eventGenerated", adopt: "eventAdopt", dismiss: "eventDismiss",
    restore: "eventRestore", dispatching: "eventDispatching", started: "eventStarted", complete: "eventComplete", adjust: "eventAdjust", archived: "eventArchived" };
  const editor = editing ? <form className="pai-ideas-finish" onSubmit={event => { event.preventDefault();
      void update(editing).then(ok => { if (ok) edit(null); }); }}>
      <label>{t(editing === "complete" ? "note" : editing === "adjust" ? "adjustNote" : "dismissReason")}
        <textarea required={editing !== "dismiss"} maxLength={editing === "complete" ? 8000 : 2000} value={note} onChange={event => setNote(event.target.value)} /></label>
      <button type="submit" className="pai-ideas-primary" disabled={disabled || (editing !== "dismiss" && !note.trim())}>
        {t(editing === "complete" ? "saveCompletion" : editing === "adjust" ? "saveAdjustment" : "confirmDismiss")}</button>
      <button type="button" onClick={() => edit(null)}>{t("cancel")}</button></form> : null;
  if (detail) {
    // 通用历史任务使用当前目录的详情样式；点击时冻结的执行资料仍保留在原记录中。
    const template = idea.source === "general" ? GENERAL_IDEAS.find(item => item.id === idea.templateId) : undefined;
    const contents = template?.includes ?? (idea.includes?.length ? idea.includes : [{ title: idea.title, description: idea.description }]);
    return <article className="pai-ideas-sheet" aria-label={idea.title}>
      <header className="pai-ideas-sheet-header"><h2>{idea.title}</h2><button type="button" autoFocus aria-label={t("closeDetail")} onClick={onClose}>×</button></header>
      <div className="pai-ideas-sheet-body"><p className="pai-ideas-sheet-intro">{idea.description}</p>
        {idea.source !== "general" && <p className="pai-ideas-goal">{t(idea.basis === "goal" ? "goalOrigin" : "memoryOrigin")}
          {idea.goalRef && <> · {idea.goal} · {idea.goalRef.title}</>}</p>}
        <h3>{t("includesTitle")}</h3><ul className="pai-ideas-includes">{contents.map((item, n) => <li key={n}>
          <span className="pai-ideas-include-icon" aria-hidden>{n === 0 ? "◷" : "▤"}</span><div><strong>{item.title}</strong><p>{item.description}</p></div>
          <span className="pai-ideas-included" aria-label={t("included")}>✓</span></li>)}</ul>
        <h3>{t("howTitle")}</h3><p className="pai-ideas-sheet-how">{template ? `${template.howItWorks} ${t("startPolicy")}` : idea.howItWorks || t("workflowFallback")}</p>
        {idea.feedback?.some(item => item.kind === "adjust") && <p className="pai-ideas-adjusted">{t("yourAdjustment")}：{idea.feedback.filter(item => item.kind === "adjust").at(-1)?.note}</p>}
        {pending && <p className="pai-ideas-pending">{t("pending")}</p>}
        {error && <div className="pai-ideas-error" role="alert">{error}</div>}
        {idea.completion && <p className="pai-ideas-completion">{idea.completion.note}</p>}
        {idea.execution && <ProgressPanel idea={idea} api={api} t={t} />}
        {editor}
      </div>
      <footer className="pai-ideas-sheet-footer"><details className="pai-ideas-sheet-menu" onClick={event => { if ((event.target as Element).closest("button")) event.currentTarget.open = false; }}><summary aria-label={t("moreActions")}>···</summary><div>
        {idea.status === "suggested" && !pending && <button type="button" disabled={disabled} onClick={() => { void update("adopt"); }}>{t("adopt")}</button>}
        {active && !pending && <><button type="button" disabled={disabled} onClick={() => edit("adjust")}>{t("adjust")}</button>
          <button type="button" disabled={disabled} onClick={() => edit("dismiss")}>{t("dismiss")}</button></>}
        {idea.status === "started" && <button type="button" disabled={disabled} onClick={() => edit("complete")}>{t("complete")}</button>}
        {idea.status === "dismissed" && <button type="button" disabled={disabled} onClick={() => { void update("restore"); }}>{t("restore")}</button>}
        <details><summary>{t(idea.source === "general" ? "generalEvidence" : "evidence")}</summary><p className="pai-ideas-pre">{idea.instruction}</p>{idea.evidence.map((text,n) => <blockquote key={n}>{text}</blockquote>)}</details>
      </div></details>
      {active ? <button type="button" className="pai-ideas-primary" disabled={disabled || !!editing} onClick={start}>✧ {t(pending ? "retry" : "startNow")}</button>
        : idea.execution ? <button type="button" className="pai-ideas-primary" onClick={() => api.openConversation(idea.execution!.sessionId)}>{t("viewConversation")} →</button>
        : <button type="button" onClick={onClose}>{t("closeDetail")}</button>}
      </footer>
    </article>;
  }
  return <article className="pai-ideas-card" data-status={idea.status} data-clickable={active && !disabled && !editing}
    onClick={event => { if (!(event.target as Element).closest("button,details,form,a,input,textarea")) onSelect(); }}>
    <div className="pai-ideas-card-top"><span className="pai-ideas-number">IDEA {String(index + 1).padStart(2, "0")}</span>
      <span className={`pai-ideas-badge pai-ideas-${idea.status}`}>{progressLabel(idea, t)}</span></div>
    <h2>{active ? <button type="button" className="pai-ideas-card-link" disabled={disabled || !!editing} onClick={onSelect}>{idea.title} ↗</button> : idea.title}</h2>
    <p className="pai-ideas-description">{idea.description}</p>
    {idea.source !== "general" && <p className="pai-ideas-goal">{t(idea.basis === "goal" ? "goalOrigin" : "memoryOrigin")}
      {idea.goalRef && <> · {idea.goalRef.title}</>}</p>}
    {idea.goal && <p className="pai-ideas-goal">{t("relatedGoal")} · {idea.goal}</p>}
    <div className="pai-ideas-reason"><span>{t(idea.source === "general" ? "generalOrigin" : "why")}</span><p>{idea.reason}</p></div>
    {idea.feedback?.some(item => item.kind === "adjust") && <p className="pai-ideas-adjusted">{t("yourAdjustment")}：{idea.feedback.filter(item => item.kind === "adjust").at(-1)?.note}</p>}
    <details className="pai-ideas-details"><summary>{t(idea.source === "general" ? "generalEvidence" : "evidence")}</summary>
      {idea.evidence.map((text, n) => <blockquote key={n}>{text}</blockquote>)}
      <h3>{t("instruction")}</h3><p className="pai-ideas-pre">{idea.instruction}</p>
      <h3>{t("history")}</h3><ul>{idea.history.map((event, n) => <li key={n}>
        <time>{formatDate(event.at)}</time> · {eventLabels[event.action] ? t(eventLabels[event.action]!) : event.action}
        {event.note && <span> · {event.note}</span>}</li>)}</ul>
    </details>
    {pending && <p className="pai-ideas-pending">{t("pending")}</p>}
    {idea.completion && <div className="pai-ideas-completion"><strong>✓ {t("completed")}</strong>
      <p>{idea.completion.note}</p><time>{formatDate(idea.completion.at)}</time></div>}
    <GoalSyncStatus idea={idea} api={api} t={t} />
    <div className="pai-ideas-card-actions">
      {idea.execution && <button type="button" onClick={onSelect}>{t("viewProgress")} →</button>}
      {active && <button type="button" className="pai-ideas-primary" disabled={disabled || !!editing} onClick={onSelect}>{t("viewIdea")} →</button>}
      {idea.status === "suggested" && !pending && <button type="button" disabled={disabled} onClick={() => { void update("adopt"); }}>{t("adopt")}</button>}
      {active && !pending && <><button type="button" disabled={disabled} onClick={() => edit("adjust")}>{t("adjust")}</button>
        <button type="button" className="pai-ideas-quiet" disabled={disabled} onClick={() => edit("dismiss")}>{t("dismiss")}</button></>}
      {idea.status === "dismissed" && <button type="button" disabled={disabled} onClick={() => { void update("restore"); }}>{t("restore")}</button>}
      {idea.execution && <button type="button" onClick={() => api.openConversation(idea.execution!.sessionId)}>{t("viewConversation")} →</button>}
      {idea.status === "started" && <button type="button" disabled={disabled} onClick={() => edit("complete")}>{t("complete")}</button>}
    </div>
    {editor}
  </article>;
}

/** 内联 SVG 是代码原生图标，不额外加载位图或第三方图标库。 */
export function Bulb({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M9 18h6M9.5 21h5M8.2 14.4a6 6 0 1 1 7.6 0c-.8.6-.8 1.5-.8 2.6H9c0-1.1 0-2-.8-2.6Z" />
    <path d="M12 2V.5M4 5 2.8 3.8M20 5l1.2-1.2M3 11H1.5M21 11h1.5" /></svg>;
}
function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" }).format(new Date(value));
}

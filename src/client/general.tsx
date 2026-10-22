/** 通用目录直接展示，不依赖记忆或模型；浏览详情不会保存偏好或启动任务。 */
import { GENERAL_CATEGORIES, GENERAL_IDEAS, type GeneralIdea } from "../catalog.js";
import type { IdeasApi } from "./api.js";
import { ProgressPanel } from "./progress.js";
import type { Translate } from "./locales.js";

export function GeneralCatalog({ t, onSelect }: { t: Translate; onSelect(id: string): void }) {
  return <div className="pai-ideas-general"><p className="pai-ideas-general-heading">{t("generalTitle")}</p>
    <p className="pai-ideas-general-hint">{t("generalHint")}</p>
    {GENERAL_CATEGORIES.map(category => <section key={category} aria-label={category}>
      <h2>{category}</h2>{GENERAL_IDEAS.filter(item => item.category === category).map(item =>
        <button type="button" className="pai-ideas-general-row" key={item.id} onClick={() => onSelect(item.id)}>
          <span className="pai-ideas-general-icon" aria-hidden>{item.icon}</span><span className="pai-ideas-general-copy">
            <strong>{item.title}</strong><span>{item.description}</span></span><span aria-hidden>›</span>
        </button>)}
    </section>)}
  </div>;
}

/** 明确点击开始后才经宿主目录创建任务，再使用既有的主聊天交接流程。 */
export function GeneralDetail({ item, api, t, sessionId, onClose }: {
  item: GeneralIdea; api: IdeasApi; t: Translate; sessionId?: string; onClose(): void;
}) {
  const state = api.getSnapshot();
  const record = state.ideas.find(idea => idea.templateId === item.id && !["completed", "dismissed"].includes(idea.status) && idea.progress?.lifecycle !== "stopped");
  const accepted = record?.execution?.state === "accepted";
  return <article className="pai-ideas-sheet" aria-label={item.title}>
    <header className="pai-ideas-sheet-header"><h2>{item.icon} {item.title}</h2>
      <button type="button" autoFocus aria-label={t("closeDetail")} onClick={onClose}>×</button></header>
    <div className="pai-ideas-sheet-body"><span className="pai-ideas-badge">{t("generalOrigin")}</span>
      <p className="pai-ideas-sheet-intro">{item.description}</p>
      <h3>{t("includesTitle")}</h3><ul className="pai-ideas-includes">{item.includes.map((part, n) => <li key={n}>
        <span className="pai-ideas-include-icon" aria-hidden>▤</span><div><strong>{part.title}</strong><p>{part.description}</p></div>
        <span className="pai-ideas-included" aria-label={t("included")}>✓</span></li>)}</ul>
      <h3>{t("howTitle")}</h3><p className="pai-ideas-sheet-how">{item.howItWorks} {t("startPolicy")}</p>
      <small>{t("includedHint")}</small>
      {record && <ProgressPanel idea={record} api={api} t={t} />}
      {record?.execution?.state === "pending" && <p className="pai-ideas-pending">{t("pending")}</p>}
      {state.error && <div className="pai-ideas-error" role="alert">{state.error}</div>}
    </div>
    <footer className="pai-ideas-sheet-footer"><details className="pai-ideas-sheet-menu"><summary aria-label={t("moreActions")}>···</summary><div>
      <strong>{t("generalNeeds")}</strong><ul>{item.needs.map(need => <li key={need}>{need}</li>)}</ul>
      <strong>{t("defaultFollowup")}</strong><p>{item.defaultFollowUp}</p><strong>{t("completionRule")}</strong><p>{item.completionRule}</p>
      <button type="button" onClick={onClose}>{t("closeDetail")}</button></div></details>
      <button type="button" className="pai-ideas-primary" disabled={state.busy} onClick={() => {
        if (accepted) api.openConversation(record.execution!.sessionId);
        else void api.run("startGeneral", { templateId: item.id, sessionId });
      }}>{accepted ? t("viewConversation") : record?.execution ? t("retry") : t("startNow")}</button></footer>
  </article>;
}

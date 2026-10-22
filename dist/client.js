window.__ModuleLoader__.load({id:"@personal-ai/ideas-dsh-plugin",factory:(require)=>{var module={exports:{}};var exports=module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react3 = require("react");

// src/types.ts
var HANDOFF_SOURCE = "personal-ideas-context";
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isIdeaDraft(value, allowEmptyEvidence = false) {
  return isRecord(value) && ["title", "description", "reason", "instruction"].every(
    (key) => typeof value[key] === "string" && value[key].trim().length > 0 && value[key].length <= 8e3
  ) && typeof value.title === "string" && value.title.length <= 160 && Array.isArray(value.evidenceIds) && (allowEmptyEvidence || value.evidenceIds.length > 0) && value.evidenceIds.every((id) => Number.isInteger(id) && id > 0) && (value.basis === void 0 || ["memory", "goal"].includes(String(value.basis))) && (value.goalRef === void 0 || isRecord(value.goalRef) && ["goalId", "taskId", "title"].every(
    (key) => typeof value.goalRef[key] === "string" && String(value.goalRef[key]).trim().length > 0
  )) && ["goal", "intent"].every((key) => value[key] === void 0 || typeof value[key] === "string" && value[key].length <= 500) && (value.value === void 0 || Number.isInteger(value.value) && Number(value.value) >= 1 && Number(value.value) <= 5) && (value.howItWorks === void 0 || typeof value.howItWorks === "string" && value.howItWorks.length <= 2e3) && (value.includes === void 0 || Array.isArray(value.includes) && value.includes.length >= 1 && value.includes.length <= 4 && value.includes.every((item) => isRecord(item) && typeof item.title === "string" && item.title.trim().length > 0 && item.title.length <= 160 && typeof item.description === "string" && item.description.length <= 500));
}
function isIdea(value) {
  if (!isRecord(value) || !isIdeaDraft(value, value.source === "general")) return false;
  return typeof value.id === "string" && /^[a-f\d-]{36}$/.test(value.id) && ["suggested", "adopted", "started", "completed", "dismissed"].includes(String(value.status)) && Number.isInteger(value.revision) && Number(value.revision) > 0 && ["createdAt", "updatedAt", "query", "provider", "model"].every((key) => typeof value[key] === "string") && Array.isArray(value.evidence) && value.evidence.every((item) => typeof item === "string") && Array.isArray(value.history) && value.history.every((item) => isRecord(item) && typeof item.at === "string" && typeof item.action === "string" && (item.note === void 0 || typeof item.note === "string")) && (value.execution === void 0 || isRecord(value.execution) && typeof value.execution.sessionId === "string" && typeof value.execution.requestId === "string" && ["pending", "accepted"].includes(String(value.execution.state)) && (value.execution.handoffVersion === void 0 || value.execution.handoffVersion === 1 && typeof value.execution.title === "string" && value.execution.title.length <= 160 && typeof value.execution.context === "string" && value.execution.context.length > 0 && value.execution.context.length <= 64e3)) && (value.completion === void 0 || isRecord(value.completion) && typeof value.completion.at === "string" && typeof value.completion.note === "string") && (value.goalSync === void 0 || isRecord(value.goalSync) && ["pending", "synced", "error"].includes(String(value.goalSync.state)) && (value.goalSync.at === void 0 || typeof value.goalSync.at === "string") && (value.goalSync.error === void 0 || typeof value.goalSync.error === "string")) && (value.progress === void 0 || isProgress(value.progress)) && (value.source === void 0 || ["automatic", "manual", "general"].includes(String(value.source))) && (value.batchId === void 0 || typeof value.batchId === "string") && (value.batchOrder === void 0 || Number.isInteger(value.batchOrder) && Number(value.batchOrder) >= 0) && (value.sourceNote === void 0 || typeof value.sourceNote === "string") && (value.source !== "general" || typeof value.templateId === "string" && /^general-\d{2}$/.test(value.templateId) && value.evidenceIds.length === 0 && value.evidence.length === 0) && ["expiresAt", "archivedAt"].every((key) => value[key] === void 0 || typeof value[key] === "string" && Number.isFinite(Date.parse(value[key]))) && (value.feedback === void 0 || Array.isArray(value.feedback) && value.feedback.every((item) => isRecord(item) && typeof item.at === "string" && ["adjust", "dismiss"].includes(String(item.kind)) && typeof item.note === "string" && item.note.length <= 2e3));
}
function isProgress(p) {
  if (!isRecord(p) || !["active", "paused", "completed", "stopped"].includes(String(p.lifecycle)) || !["queued", "running", "waiting_input", "waiting_approval", "waiting_external", "review", "failed", "interrupted", "tracking"].includes(String(p.run)) || !["once", "ongoing", "mixed"].includes(String(p.mode)) || typeof p.summary !== "string" || typeof p.nextStep !== "string" || typeof p.completionRule !== "string" || !Number.isInteger(p.lastSeq) || Number(p.lastSeq) < -1 || p.turn !== void 0 && !Number.isInteger(p.turn) || !Array.isArray(p.requests) || !p.requests.every((id) => typeof id === "string") || p.pendingFollowup !== void 0 && (!isRecord(p.pendingFollowup) || typeof p.pendingFollowup.requestId !== "string" || typeof p.pendingFollowup.note !== "string") || !Array.isArray(p.artifacts) || !p.artifacts.every((a) => isRecord(a) && typeof a.path === "string" && Number.isInteger(a.seq) && typeof a.at === "string") || !Array.isArray(p.activity) || !p.activity.every((a) => isRecord(a) && typeof a.at === "string" && typeof a.summary === "string" && typeof a.source === "string" && (a.seq === void 0 || Number.isInteger(a.seq)))) return false;
  const f = p.followUp;
  const rule = isRecord(f) ? f.rule : void 0;
  return isRecord(f) && ["off", "active", "paused", "ended", "error"].includes(String(f.state)) && Array.isArray(f.ids) && f.ids.every((id) => typeof id === "string") && ["nextAt", "error"].every((key) => f[key] === void 0 || typeof f[key] === "string") && (p.lastVerifiedAt === void 0 || typeof p.lastVerifiedAt === "string") && (rule === void 0 || isRecord(rule) && ["cron", "at", "until"].every((key) => rule[key] === void 0 || typeof rule[key] === "string"));
}

// src/client/api.ts
function createIdeasApi(rpc, navigation) {
  let state = {
    ideas: [],
    generating: false,
    storageDir: "",
    route: { provider: "", model: "" },
    engine: { enabled: true, lastUpdatedAt: "", nextAttemptAt: "", lastError: "", attemptsToday: 0 },
    loading: true,
    busy: false,
    error: "",
    notice: ""
  };
  let revision = 0, manual = false;
  let timer;
  const listeners = /* @__PURE__ */ new Set();
  const lifetime = new AbortController();
  const publish = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const invoke = async (method, request) => {
    const result = await rpc.call("/api", `ideas/${method}`, { args: method === "list" ? {} : { request } }, lifetime.signal);
    if (!result.ok) throw new Error(result.error.message || result.error.code);
    const value = result.value;
    if (!isRecord(value) || !Array.isArray(value.ideas) || !value.ideas.every(isIdea) || typeof value.generating !== "boolean" || typeof value.storageDir !== "string" || value.sourceNotice !== void 0 && typeof value.sourceNotice !== "string" || !isRecord(value.route) || typeof value.route.provider !== "string" || typeof value.route.model !== "string")
      throw new Error("Ideas RPC response is invalid.");
    const engine = value.engine;
    if (engine !== void 0 && (!isRecord(engine) || typeof engine.enabled !== "boolean" || typeof engine.lastUpdatedAt !== "string" || typeof engine.nextAttemptAt !== "string" || typeof engine.lastError !== "string" || !Number.isInteger(engine.attemptsToday)))
      throw new Error("Ideas background status is invalid.");
    return {
      ideas: value.ideas,
      generating: value.generating || manual,
      storageDir: value.storageDir,
      sourceNotice: typeof value.sourceNotice === "string" ? value.sourceNotice : "",
      route: { provider: value.route.provider, model: value.route.model },
      engine: engine ?? state.engine
    };
  };
  const refresh = async () => {
    const request = ++revision;
    try {
      const snapshot = await invoke("list", {});
      if (!lifetime.signal.aborted && request === revision) publish({ ...snapshot, loading: false });
    } catch (error) {
      if (!lifetime.signal.aborted && request === revision) publish({ loading: false, error: errorText(error) });
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      if (!timer) {
        timer = setInterval(() => {
          if (typeof document === "undefined" || document.visibilityState !== "hidden") void refresh();
        }, 15e3);
        timer.unref?.();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          clearInterval(timer);
          timer = void 0;
        }
      };
    },
    refresh,
    dispose: () => {
      lifetime.abort();
      clearInterval(timer);
      listeners.clear();
    },
    openConversation(id) {
      try {
        navigation?.openSession(id);
      } catch (error) {
        publish({ error: errorText(error) });
      }
    },
    /** 接受任务后才导航；失败保留原卡片和 pending，请求 ID 由 Host 持久化去重。 */
    async run(method, input) {
      if (lifetime.signal.aborted || (method === "generate" ? state.generating : state.busy)) return false;
      ++revision;
      if (method === "generate") manual = true;
      publish({ error: "", notice: "", ...method === "generate" ? { generating: true } : { busy: true } });
      try {
        let request = input;
        const starting = method === "start" || method === "startGeneral";
        const matches = (item) => isRecord(input) && (method === "startGeneral" ? item.templateId === input.templateId && !["completed", "dismissed"].includes(item.status) && item.progress?.lifecycle !== "stopped" : item.id === input.id);
        if (starting && isRecord(input)) {
          const idea = state.ideas.find(matches);
          const sessionId = idea?.execution?.sessionId || input.sessionId || await navigation?.createSession();
          if (!sessionId) throw new Error("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A DSH \u4F1A\u8BDD\u3002");
          request = { ...input, sessionId };
        }
        const snapshot = await invoke(method, request);
        ++revision;
        publish({ ...snapshot, loading: false, notice: method === "generate" ? "generated" : starting ? "sent" : "updated" });
        if (starting && isRecord(input)) {
          const idea = snapshot.ideas.find(matches);
          if (idea?.execution?.state === "accepted") navigation?.openSession(idea.execution.sessionId);
        }
        return true;
      } catch (error) {
        await refresh();
        if (!lifetime.signal.aborted) publish({ error: errorText(error) });
        return false;
      } finally {
        if (method === "generate") {
          manual = false;
          await refresh();
        } else if (!lifetime.signal.aborted) publish({ busy: false });
      }
    }
  };
}
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/client/locales.ts
var zh = {
  title: "Ideas",
  subtitle: "\u4E3A\u4F60\u51C6\u5907\u597D\u7684\u4E0B\u4E00\u6B65\uFF0C\u9009\u4E00\u5F20\u5361\u7247\uFF0C\u5728\u804A\u5929\u4E2D\u5F00\u59CB\u3002",
  compactSubtitle: "\u4E3A\u4F60\u51C6\u5907\u7684\u4E0B\u4E00\u6B65",
  generate: "\u751F\u6210 Ideas",
  generating: "\u6B63\u5728\u8BFB\u53D6\u8BB0\u5FC6\u4E0E\u76EE\u6807\u5E76\u751F\u6210\u2026",
  refresh: "\u5237\u65B0",
  open: "\u6253\u5F00 Ideas",
  back: "\u8FD4\u56DE\u5F53\u524D\u4F1A\u8BDD",
  topic: "\u5173\u6CE8\u4E3B\u9898\uFF08\u53EF\u9009\uFF09",
  placeholder: "\u4F8B\u5982\uFF1A\u63A8\u8FDB\u4E2A\u4EBA AI \u9879\u76EE\uFF0C\u6216\u7559\u7A7A\u81EA\u52A8\u53D1\u73B0",
  count: "\u6761\u8BB0\u5F55",
  active: "\u4E3A\u4F60\u63A8\u8350",
  all: "\u5168\u90E8",
  completed: "\u5DF2\u5B8C\u6210",
  dismissed: "\u5DF2\u5FFD\u7565",
  adopted: "\u5DF2\u91C7\u7EB3",
  started: "\u5DF2\u4EA4\u63A5",
  suggested: "\u65B0\u63A8\u8350",
  adopt: "\u91C7\u7EB3",
  start: "\u5F00\u59CB\u5904\u7406",
  retry: "\u91CD\u8BD5\u53D1\u9001",
  dismiss: "\u5FFD\u7565",
  restore: "\u6062\u590D\u63A8\u8350",
  complete: "\u786E\u8BA4\u5B8C\u6210",
  note: "\u5B8C\u6210\u8BF4\u660E\u6216\u4EA7\u7269\u8DEF\u5F84",
  cancel: "\u53D6\u6D88",
  saveCompletion: "\u4FDD\u5B58\u5B8C\u6210\u8BB0\u5F55",
  why: "\u4E3A\u4EC0\u4E48\u9002\u5408\u4F60",
  evidence: "\u8BB0\u5FC6\uFF0F\u76EE\u6807\u4F9D\u636E\u4E0E\u6267\u884C\u6307\u4EE4",
  memoryOrigin: "\u6765\u81EA\u8BB0\u5FC6",
  goalOrigin: "\u6765\u81EA\u76EE\u6807",
  goalSynced: "\u5DF2\u540C\u6B65\uFF1AGoals \u4E2D\u7684\u5173\u8054\u6B65\u9AA4\u5DF2\u5B8C\u6210\u3002",
  goalSyncPending: "Ideas \u5DF2\u5B8C\u6210\uFF0C\u7B49\u5F85\u540C\u6B65\u5230 Goals\u3002",
  goalSyncError: "Ideas \u5DF2\u5B8C\u6210\uFF0CGoals \u540C\u6B65\u5931\u8D25\u3002",
  retryGoalSync: "\u91CD\u8BD5\u540C\u6B65 Goals",
  instruction: "\u6267\u884C\u6307\u4EE4",
  history: "\u64CD\u4F5C\u8BB0\u5F55",
  empty: "\u6B63\u5728\u4E3A\u4F60\u51C6\u5907\u5EFA\u8BAE",
  emptyHint: "DSH \u4F1A\u5728\u540E\u53F0\u7ED3\u5408\u8BB0\u5FC6\u3001\u76EE\u6807\u672A\u5B8C\u6210\u6B65\u9AA4\u548C\u8FD1\u671F\u5BF9\u8BDD\u51C6\u5907\u63A8\u8350\u3002\u4F60\u53EF\u4EE5\u7EE7\u7EED\u804A\u5929\uFF0C\u7A0D\u540E\u56DE\u6765\u67E5\u770B\u3002",
  noMatch: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u8BB0\u5F55\u3002",
  noSession: "\u9009\u62E9\u5361\u7247\u540E\u5C06\u521B\u5EFA\u804A\u5929\u4F1A\u8BDD",
  target: "\u4EA4\u63A5\u4F1A\u8BDD",
  loading: "\u6B63\u5728\u8BFB\u53D6 Ideas\u2026",
  generated: "\u65B0 Ideas \u5DF2\u4FDD\u5B58\u3002",
  updated: "\u8BB0\u5F55\u5DF2\u4FDD\u5B58\u3002",
  sent: "\u5DF2\u5C06\u6307\u4EE4\u53D1\u9001\u5230\u6240\u9009 DSH \u4F1A\u8BDD\uFF0C\u7531 Agent \u7EE7\u7EED\u5904\u7406\u3002",
  pending: "\u53D1\u9001\u7ED3\u679C\u5F85\u786E\u8BA4\uFF1B\u91CD\u8BD5\u4F1A\u6CBF\u7528\u539F\u8BF7\u6C42\uFF0C\u4E0D\u4F1A\u6362\u4F1A\u8BDD\u6295\u9012\u3002",
  storage: "\u672C\u5730\u8BB0\u5F55",
  route: "\u63A8\u8350\u6A21\u578B",
  busy: "\u6B63\u5728\u5904\u7406\u2026",
  error: "\u64CD\u4F5C\u5931\u8D25",
  instructions: "\u4FDD\u7559\u6309\u4E3B\u9898\u751F\u6210\u3002\u70B9\u51FB\u63A8\u8350\u5361\u7247\u4F1A\u643A\u5E26\u4EFB\u52A1\u4E0A\u4E0B\u6587\u8FDB\u5165\u804A\u5929\uFF0C\u7531 DSH Agent \u63A5\u624B\u3002",
  noteRequired: "\u8BF7\u5148\u586B\u5199\u5B8C\u6210\u8BF4\u660E\u3002",
  eventGenerated: "\u751F\u6210\u63A8\u8350",
  eventAdopt: "\u91C7\u7EB3",
  eventDismiss: "\u5FFD\u7565",
  eventRestore: "\u6062\u590D",
  eventDispatching: "\u51C6\u5907\u53D1\u9001",
  eventStarted: "\u53D1\u9001\u7ED9 DSH",
  eventComplete: "\u786E\u8BA4\u5B8C\u6210",
  customGenerate: "\u81EA\u5B9A\u4E49\u751F\u6210",
  backgroundWorking: "\u6B63\u5728\u540E\u53F0\u51C6\u5907\u65B0\u5EFA\u8BAE\uFF0C\u5DF2\u6709\u5361\u7247\u53EF\u7EE7\u7EED\u4F7F\u7528",
  backgroundReady: "\u63A8\u8350\u4F1A\u5728\u540E\u53F0\u81EA\u52A8\u66F4\u65B0",
  backgroundOff: "\u81EA\u52A8\u63A8\u8350\u5DF2\u5173\u95ED",
  lastUpdated: "\u4E0A\u6B21\u66F4\u65B0",
  nextUpdate: "\u4E0B\u6B21\u81EA\u52A8\u66F4\u65B0\uFF08\u6700\u65E9\uFF09",
  backgroundFailed: "\u6682\u65F6\u65E0\u6CD5\u66F4\u65B0\uFF0C\u5DF2\u6709\u63A8\u8350\u4ECD\u53EF\u4F7F\u7528\uFF0C\u540E\u53F0\u7A0D\u540E\u91CD\u8BD5\u3002",
  newReady: "\u6761\u65B0\u5EFA\u8BAE\u5DF2\u51C6\u5907\u597D\uFF0C\u70B9\u51FB\u67E5\u770B",
  showMore: "\u5C55\u5F00\u5176\u4F59\u63A8\u8350",
  showLess: "\u6536\u8D77",
  relatedGoal: "\u5173\u8054\u76EE\u6807",
  yourAdjustment: "\u4F60\u7684\u8C03\u6574",
  adjust: "\u8C03\u6574",
  adjustNote: "\u5E0C\u671B\u5982\u4F55\u8C03\u6574\u4EFB\u52A1\u6216\u63A8\u8350\u65B9\u5411\uFF1F",
  dismissReason: "\u5FFD\u7565\u539F\u56E0\uFF08\u53EF\u9009\uFF09",
  saveAdjustment: "\u4FDD\u5B58\u8C03\u6574",
  confirmDismiss: "\u786E\u8BA4\u5FFD\u7565",
  viewConversation: "\u67E5\u770B\u4F1A\u8BDD",
  eventAdjust: "\u8C03\u6574\u9700\u6C42",
  eventArchived: "\u5F52\u6863\u5019\u9009",
  manualHint: "\u81EA\u52A8\u63A8\u8350\u5DF2\u5173\u95ED\uFF0C\u53EF\u5728\u4E0B\u65B9\u81EA\u5B9A\u4E49\u751F\u6210\uFF0C\u6216\u5728\u63D2\u4EF6\u914D\u7F6E\u4E2D\u542F\u7528\u540E\u53F0\u63A8\u8350\u3002",
  includesTitle: "\u5305\u542B\u54EA\u4E9B\u5185\u5BB9",
  howTitle: "\u5982\u4F55\u8FD0\u4F5C",
  startNow: "\u9A6C\u4E0A\u5F00\u59CB",
  viewIdea: "\u67E5\u770B\u5EFA\u8BAE",
  closeDetail: "\u8FD4\u56DE\u63A8\u8350",
  moreActions: "\u66F4\u591A\u64CD\u4F5C",
  included: "\u5305\u542B\u6B64\u9879",
  selectedIdea: "\u4F60\u9009\u62E9\u4E86 Ideas",
  generalTitle: "\u4E5F\u53EF\u4EE5\u8BD5\u8BD5\u8FD9\u4E9B",
  generalHint: "\u901A\u7528\u70B9\u5B50\uFF0C\u6309\u9700\u9009\u62E9\u3002",
  generalOrigin: "\u901A\u7528\u70B9\u5B50",
  generalNeeds: "\u5F00\u59CB\u524D\u9700\u8981",
  generalEvidence: "\u4EFB\u52A1\u6765\u6E90\u4E0E\u6267\u884C\u6307\u4EE4",
  generalHow: "\u5148\u548C\u4F60\u786E\u8BA4\u5FC5\u8981\u4FE1\u606F\uFF0C\u518D\u6574\u7406\u65B9\u6848\u5E76\u5728\u804A\u5929\u4E2D\u63A8\u8FDB\u3002\u9700\u8981\u9884\u7EA6\u3001\u4E0B\u5355\u6216\u8054\u7CFB\u4ED6\u4EBA\u65F6\uFF0C\u5148\u4E0E\u4F60\u786E\u8BA4\u5177\u4F53\u64CD\u4F5C\u3002",
  inProgress: "\u8FDB\u884C\u4E2D",
  viewProgress: "\u67E5\u770B\u8FDB\u5EA6",
  progressTitle: "\u76EE\u6807\u4E0E\u6267\u884C\u8FDB\u5EA6",
  legacyProgress: "\u5DF2\u4EA4\u63A5\uFF0C\u6267\u884C\u72B6\u6001\u5F85\u6838\u5BF9\u3002",
  nextStep: "\u4E0B\u4E00\u6B65",
  completionRule: "\u5B8C\u6210\u53E3\u5F84",
  completionHint: "\u4E00\u8F6E\u56DE\u590D\u7ED3\u675F\u4E0D\u7B49\u4E8E\u6574\u4F53\u5B8C\u6210\uFF1B\u4F9D\u636E\u771F\u5B9E\u4EA7\u7269\u3001\u7ED3\u679C\u548C\u7528\u6237\u66F4\u65B0\u6838\u5BF9\u3002",
  followupTitle: "\u540E\u7EED\u8DDF\u8E2A",
  followup_off: "\u5C1A\u672A\u5EFA\u7ACB\u8DDF\u8FDB\u6392\u7A0B",
  followup_active: "\u5DF2\u6838\u5B9E\u771F\u5B9E\u6392\u7A0B",
  followup_paused: "\u5173\u8054\u6392\u7A0B\u5DF2\u6682\u505C",
  followup_ended: "\u540E\u7EED\u6392\u7A0B\u5DF2\u7ED3\u675F",
  followup_error: "\u6392\u7A0B\u72B6\u6001\u5F85\u6838\u5BF9",
  nextCheck: "\u4E0B\u6B21\u68C0\u67E5\uFF08\u4E0A\u6D77\u65F6\u95F4\uFF09",
  scheduleId: "\u6392\u7A0B\u7F16\u53F7",
  hostRequired: "\u5B9A\u65F6\u68C0\u67E5\u4F9D\u8D56 DSH \u4FDD\u6301\u8FD0\u884C\uFF1B\u65E0\u53D8\u5316\u53EA\u8BB0\u5F55\uFF0C\u91CD\u8981\u53D8\u5316\u65F6\u518D\u901A\u77E5\u3002",
  artifacts: "\u5DF2\u5C55\u793A\u6784\u4EF6",
  presentedSource: "DSH \u6784\u4EF6\u4E8B\u4EF6",
  lastVerified: "\u6700\u8FD1\u6838\u9A8C",
  pauseTracking: "\u6682\u505C\u8DDF\u8E2A",
  resumeTracking: "\u6062\u590D\u8DDF\u8E2A",
  stopTracking: "\u7ED3\u675F\u8DDF\u8E2A",
  pausedGoal: "\u5DF2\u6682\u505C",
  stoppedGoal: "\u5DF2\u7ED3\u675F\u8DDF\u8E2A",
  progressNote: "\u8865\u5145\u8FDB\u5C55\u3001\u4FEE\u6539\u8981\u6C42\u6216\u586B\u5199\u6574\u4F53\u5B8C\u6210\u4F9D\u636E",
  sendProgress: "\u8865\u5145\u8FDB\u5C55\u5E76\u7EE7\u7EED",
  completeWithNote: "\u4F9D\u636E\u8BF4\u660E\u786E\u8BA4\u6574\u4F53\u5B8C\u6210",
  recentActivity: "\u6700\u8FD1\u52A8\u6001\u4E0E\u6765\u6E90",
  run_queued: "\u7B49\u5F85\u6267\u884C",
  run_running: "\u6B63\u5728\u6267\u884C",
  run_waiting_input: "\u7B49\u4F60\u8865\u5145\u8D44\u6599",
  run_waiting_approval: "\u7B49\u4F60\u5BA1\u6279",
  run_waiting_external: "\u7B49\u5F85\u5916\u90E8\u7ED3\u679C",
  run_review: "\u672C\u8F6E\u7ED3\u675F\uFF0C\u5F85\u6838\u9A8C",
  run_failed: "\u6267\u884C\u5931\u8D25",
  run_interrupted: "\u6267\u884C\u5DF2\u4E2D\u65AD",
  run_tracking: "\u6301\u7EED\u8DDF\u8E2A\u4E2D",
  includedHint: "\u7EFF\u8272\u52FE\u9009\u8868\u793A\u5305\u542B\u6B64\u7C7B\u5DE5\u4F5C\uFF1B\u5F00\u59CB\u540E\u4EE5\u771F\u5B9E\u4EA7\u7269\u548C\u6392\u7A0B\u72B6\u6001\u4E3A\u51C6\u3002",
  defaultFollowup: "\u9ED8\u8BA4\u8DDF\u8FDB\u5B89\u6392",
  startPolicy: "\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8FDB\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u3002",
  workflowFallback: "\u6211\u4F1A\u5148\u786E\u8BA4\u5B8C\u6210\u8FD9\u9879\u4EFB\u52A1\u6240\u9700\u7684\u6761\u4EF6\uFF0C\u518D\u7ED3\u5408\u4F60\u7684\u8981\u6C42\u63A8\u8FDB\u3002\u5728\u9700\u8981\u4F60\u63D0\u4F9B\u4FE1\u606F\u6216\u4F5C\u51FA\u51B3\u5B9A\u65F6\uFF0C\u6211\u4F1A\u5728\u804A\u5929\u4E2D\u4E0E\u4F60\u786E\u8BA4\u3002"
};
var en = {
  ...zh,
  title: "Ideas",
  subtitle: "Your next step is ready. Pick a card and continue in chat.",
  compactSubtitle: "Your next useful action",
  generate: "Generate Ideas",
  generating: "Reading memory and goals\u2026",
  refresh: "Refresh",
  open: "Open Ideas",
  back: "Back to conversation",
  memoryOrigin: "From memory",
  goalOrigin: "From goals",
  goalSynced: "Synced: the linked Goals step is complete.",
  goalSyncPending: "Idea complete; Goals sync pending.",
  goalSyncError: "Idea complete; Goals sync failed.",
  retryGoalSync: "Retry Goals sync",
  topic: "Focus (optional)",
  placeholder: "A project or goal, or leave blank to discover",
  count: "records",
  active: "For you",
  all: "All",
  completed: "Completed",
  dismissed: "Dismissed",
  adopted: "Adopted",
  started: "Handed off",
  suggested: "Suggested",
  adopt: "Adopt",
  start: "Start working",
  retry: "Retry delivery",
  dismiss: "Dismiss",
  restore: "Restore",
  complete: "Mark complete",
  note: "Completion summary or artifact path",
  cancel: "Cancel",
  saveCompletion: "Save completion",
  why: "Why this fits",
  evidence: "Memory and instructions",
  instruction: "Execution instructions",
  history: "Activity",
  empty: "Preparing your suggestions",
  emptyHint: "DSH prepares suggestions from memory and recent conversations in the background. Continue chatting and check back later.",
  noMatch: "No records match this filter.",
  noSession: "Selecting a card will create a conversation",
  target: "Conversation",
  loading: "Loading Ideas\u2026",
  generated: "New Ideas saved.",
  updated: "Record saved.",
  sent: "Instructions sent to the selected DSH conversation for the Agent to handle.",
  pending: "Delivery is unconfirmed. Retry reuses the original request and conversation.",
  storage: "Local records",
  route: "Recommendation model",
  busy: "Working\u2026",
  error: "Operation failed",
  instructions: "Generate for a specific topic. Selecting a card sends its task context to the DSH Agent in chat.",
  noteRequired: "Enter a completion summary first.",
  eventGenerated: "Generated",
  eventAdopt: "Adopted",
  eventDismiss: "Dismissed",
  eventRestore: "Restored",
  eventDispatching: "Delivery prepared",
  eventStarted: "Sent to DSH",
  eventComplete: "Marked complete",
  customGenerate: "Custom generation",
  backgroundWorking: "Preparing suggestions in the background. Existing cards remain available.",
  backgroundReady: "Suggestions update in the background",
  backgroundOff: "Automatic suggestions are off",
  lastUpdated: "Updated",
  nextUpdate: "Next automatic update, earliest",
  backgroundFailed: "Could not update. Existing suggestions remain available; DSH will retry later.",
  newReady: "new suggestions ready. View them",
  showMore: "Show more suggestions",
  showLess: "Show less",
  relatedGoal: "Related goal",
  yourAdjustment: "Your adjustment",
  adjust: "Adjust",
  adjustNote: "How should this task or recommendation change?",
  dismissReason: "Reason for dismissing (optional)",
  saveAdjustment: "Save adjustment",
  confirmDismiss: "Confirm dismissal",
  viewConversation: "View conversation",
  eventAdjust: "Adjusted",
  eventArchived: "Candidate archived",
  manualHint: "Automatic suggestions are off. Generate below, or enable background recommendations in plugin settings.",
  includesTitle: "What's included",
  howTitle: "How it works",
  startNow: "Start now",
  viewIdea: "View idea",
  closeDetail: "Back to ideas",
  moreActions: "More actions",
  included: "Included",
  selectedIdea: "You selected an Idea",
  generalTitle: "\u4E5F\u53EF\u4EE5\u8BD5\u8BD5\u8FD9\u4E9B",
  generalHint: "\u901A\u7528\u70B9\u5B50\uFF0C\u6309\u9700\u9009\u62E9\u3002",
  generalOrigin: "\u901A\u7528\u70B9\u5B50",
  generalNeeds: "\u5F00\u59CB\u524D\u9700\u8981",
  generalEvidence: "\u4EFB\u52A1\u6765\u6E90\u4E0E\u6267\u884C\u6307\u4EE4",
  generalHow: "\u5148\u548C\u4F60\u786E\u8BA4\u5FC5\u8981\u4FE1\u606F\uFF0C\u518D\u6574\u7406\u65B9\u6848\u5E76\u5728\u804A\u5929\u4E2D\u63A8\u8FDB\u3002\u9700\u8981\u9884\u7EA6\u3001\u4E0B\u5355\u6216\u8054\u7CFB\u4ED6\u4EBA\u65F6\uFF0C\u5148\u4E0E\u4F60\u786E\u8BA4\u5177\u4F53\u64CD\u4F5C\u3002",
  workflowFallback: "I'll confirm what is needed, then move the task forward with your requirements. I'll ask in chat whenever I need information or a decision from you."
};

// src/client/panel.tsx
var import_react2 = require("react");

// src/catalog.ts
var GENERAL_CATEGORIES = ["\u5065\u5EB7\u4E0E\u5065\u8EAB", "\u8D22\u52A1\u7BA1\u7406", "\u6548\u7387\u63D0\u5347", "\u66F4\u591A\u70B9\u5B50"];
var GENERAL_IDEAS = [
  {
    "id": "general-01",
    "category": "\u5065\u5EB7\u4E0E\u5065\u8EAB",
    "icon": "\u{1F3CB}\uFE0F",
    "title": "\u544A\u8BC9\u6211\u4F60\u6709\u54EA\u4E9B\u5668\u6750\uFF0C\u6211\u5E2E\u4F60\u5B89\u6392\u4E00\u5468\u8BAD\u7EC3\u3002",
    "description": "\u53D1\u6765\u5BB6\u4E2D\u6216\u5065\u8EAB\u623F\u7684\u5668\u6750\u7167\u7247\uFF0C\u544A\u8BC9\u6211\u8BAD\u7EC3\u76EE\u6807\u3001\u57FA\u7840\u548C\u53EF\u7528\u65F6\u95F4\u3002\u6211\u4F1A\u7ED3\u5408\u4F60\u7684\u8EAB\u4F53\u9650\u5236\uFF0C\u6574\u7406\u52A8\u4F5C\u3001\u8BAD\u7EC3\u9891\u7387\u548C\u4F11\u606F\u5B89\u6392\u3002",
    "needs": [
      "\u5668\u6750\u7167\u7247\u6216\u6E05\u5355",
      "\u8BAD\u7EC3\u76EE\u6807\u3001\u57FA\u7840\u3001\u53EF\u7528\u65F6\u95F4\u53CA\u8EAB\u4F53\u9650\u5236"
    ],
    "deliverable": "\u4E00\u5468\u8BAD\u7EC3\u5B89\u6392\u4E0E\u52A8\u4F5C\u6CE8\u610F\u4E8B\u9879",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u544A\u8BC9\u6211\u4F60\u6709\u54EA\u4E9B\u5668\u6750\uFF0C\u6211\u5E2E\u4F60\u5B89\u6392\u4E00\u5468\u8BAD\u7EC3\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u5668\u6750\u7167\u7247\u6216\u6E05\u5355\u3001\u8BAD\u7EC3\u76EE\u6807\u3001\u57FA\u7840\u3001\u53EF\u7528\u65F6\u95F4\u53CA\u8EAB\u4F53\u9650\u5236\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u4E00\u5468\u8BAD\u7EC3\u5B89\u6392\u4E0E\u52A8\u4F5C\u6CE8\u610F\u4E8B\u9879\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592920:30\u68C0\u67E5\u8BAD\u7EC3\u6253\u5361\uFF1B\u4F18\u5148\u91C7\u7528\u5DF2\u6709\u8BAD\u7EC3\u65F6\u95F4\uFF0C\u6309\u8BAD\u7EC3\u8BA1\u5212\u7ED3\u675F\u65E5\u671F\u6536\u5C3E\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u8BAD\u7EC3\u8BA1\u5212\u4E0E\u6253\u5361\u8868\uFF1A\u5C55\u793A\u52A8\u4F5C\u5B89\u6392\u3001\u8BAD\u7EC3\u8BB0\u5F55\u4E0E\u8C03\u6574\u540E\u7684\u8BA1\u5212\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u8BAD\u7EC3\u5B89\u6392\u6216\u9ED8\u8BA4\u65F6\u95F4\u63D0\u9192\u6253\u5361\uFF0C\u7ED3\u5408\u4F60\u63D0\u4F9B\u7684\u5B8C\u6210\u60C5\u51B5\u8C03\u6574\u5B89\u6392\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u4E86\u89E3\u5668\u6750\u3001\u76EE\u6807\u3001\u8BAD\u7EC3\u57FA\u7840\u548C\u8EAB\u4F53\u9650\u5236\uFF0C\u518D\u751F\u6210\u8BAD\u7EC3\u8BA1\u5212\uFF1B\u8D44\u6599\u9F50\u5168\u540E\u76F4\u63A5\u8BBE\u7F6E\u5FC5\u8981\u7684\u5B9E\u9645\u8DDF\u8FDB\u4EFB\u52A1\u3002",
    "mode": "ongoing",
    "completionRule": "\u672C\u6B21\u8BAD\u7EC3\u5B8C\u6210\u53EF\u8BB0\u5F55\u4E00\u6B21\u8FDB\u5C55\uFF1B\u6574\u4F53\u8BA1\u5212\u5728\u76EE\u6807\u8FBE\u6210\u6216\u4F60\u660E\u786E\u7ED3\u675F\u540E\u6536\u5C3E\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592920:30\u68C0\u67E5\u8BAD\u7EC3\u6253\u5361\uFF1B\u4F18\u5148\u91C7\u7528\u5DF2\u6709\u8BAD\u7EC3\u65F6\u95F4\uFF0C\u6309\u8BAD\u7EC3\u8BA1\u5212\u7ED3\u675F\u65E5\u671F\u6536\u5C3E\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "30 20 * * *"
  },
  {
    "id": "general-02",
    "category": "\u5065\u5EB7\u4E0E\u5065\u8EAB",
    "icon": "\u{1F957}",
    "title": "\u62CD\u4E0B\u9910\u98DF\uFF0C\u6211\u5E2E\u4F60\u4F30\u7B97\u70ED\u91CF\u5E76\u8BB0\u5F55\u3002",
    "description": "\u62CD\u7167\u6216\u63CF\u8FF0\u4F60\u5403\u4E86\u4EC0\u4E48\u3001\u5403\u4E86\u591A\u5C11\uFF0C\u6211\u4F1A\u4F30\u7B97\u70ED\u91CF\u548C\u4E3B\u8981\u8425\u517B\u6210\u5206\uFF0C\u6C47\u603B\u5F53\u5929\u8BB0\u5F55\u3002\u4EFD\u91CF\u4E0D\u6E05\u695A\u65F6\u5148\u5411\u4F60\u786E\u8BA4\uFF0C\u5E76\u6807\u660E\u4F30\u7B97\u8303\u56F4\u3002",
    "needs": [
      "\u9910\u98DF\u7167\u7247\u6216\u98DF\u7269\u540D\u79F0",
      "\u5927\u81F4\u4EFD\u91CF\u53CA\u70F9\u996A\u65B9\u5F0F"
    ],
    "deliverable": "\u5F53\u9910\u70ED\u91CF\u4F30\u7B97\u4E0E\u5F53\u5929\u996E\u98DF\u8BB0\u5F55",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u62CD\u4E0B\u9910\u98DF\uFF0C\u6211\u5E2E\u4F60\u4F30\u7B97\u70ED\u91CF\u5E76\u8BB0\u5F55\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u9910\u98DF\u7167\u7247\u6216\u98DF\u7269\u540D\u79F0\u3001\u5927\u81F4\u4EFD\u91CF\u53CA\u70F9\u996A\u65B9\u5F0F\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5F53\u9910\u70ED\u91CF\u4F30\u7B97\u4E0E\u5F53\u5929\u996E\u98DF\u8BB0\u5F55\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592920:30\u6C47\u603B\u5DF2\u63D0\u4F9B\u7684\u9910\u98DF\u8BB0\u5F55\uFF1B\u53EA\u5BF9\u7F3A\u5931\u8BB0\u5F55\u96C6\u4E2D\u63D0\u9192\uFF0C\u4E0D\u5047\u5B9A\u5DF2\u7ECF\u81EA\u52A8\u8BFB\u53D6\u9910\u98DF\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u996E\u98DF\u8BB0\u5F55\u4E0E\u70ED\u91CF\u4F30\u7B97\u8868\uFF1A\u6C47\u603B\u4F60\u63D0\u4EA4\u7684\u9910\u98DF\u3001\u4EFD\u91CF\u3001\u4F30\u7B97\u8303\u56F4\u548C\u6BCF\u65E5\u8BB0\u5F55\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u65F6\u95F4\u504F\u597D\u6216\u9ED8\u8BA4\u65F6\u95F4\u56DE\u987E\u8BB0\u5F55\uFF1B\u7F3A\u5C11\u9910\u98DF\u4FE1\u606F\u65F6\u63D0\u9192\u8865\u5145\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u9910\u98DF\u4E0E\u4EFD\u91CF\uFF0C\u518D\u8BB0\u5F55\u4F30\u7B97\u7ED3\u679C\uFF1B\u6301\u7EED\u8BB0\u5F55\u4EE5\u4F60\u4E3B\u52A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E3A\u4F9D\u636E\u3002",
    "mode": "ongoing",
    "completionRule": "\u4E00\u9910\u8BB0\u5F55\u5B8C\u6210\u4E0D\u7ED3\u675F\u6574\u4E2A\u996E\u98DF\u8BB0\u5F55\u76EE\u6807\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592920:30\u6C47\u603B\u5DF2\u63D0\u4F9B\u7684\u9910\u98DF\u8BB0\u5F55\uFF1B\u53EA\u5BF9\u7F3A\u5931\u8BB0\u5F55\u96C6\u4E2D\u63D0\u9192\uFF0C\u4E0D\u5047\u5B9A\u5DF2\u7ECF\u81EA\u52A8\u8BFB\u53D6\u9910\u98DF\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "30 20 * * *"
  },
  {
    "id": "general-03",
    "category": "\u8D22\u52A1\u7BA1\u7406",
    "icon": "\u{1F9FE}",
    "title": "\u627E\u51FA\u5FD8\u8BB0\u7684\u81EA\u52A8\u7EED\u8D39\uFF0C\u6574\u7406\u53D6\u6D88\u8DEF\u5F84\u3002",
    "description": "\u63D0\u4F9B\u8BA2\u9605\u6E05\u5355\u6216\u8D26\u5355\u622A\u56FE\uFF0C\u6211\u4F1A\u6838\u5BF9\u4F1A\u5458\u3001\u7F51\u76D8\u3001\u89C6\u9891\u548C\u8F6F\u4EF6\u7B49\u91CD\u590D\u6263\u8D39\uFF0C\u5217\u51FA\u8D39\u7528\u3001\u7EED\u8D39\u65E5\u671F\uFF0C\u4EE5\u53CA\u5FAE\u4FE1\u3001\u652F\u4ED8\u5B9D\u6216\u5E94\u7528\u5185\u5BF9\u5E94\u7684\u5173\u95ED\u8DEF\u5F84\u3002\u9700\u8981\u5B9E\u9645\u53D6\u6D88\u65F6\uFF0C\u518D\u7531\u4F60\u786E\u8BA4\u3002",
    "needs": [
      "\u8BA2\u9605\u6E05\u5355\u6216\u8131\u654F\u8D26\u5355\u622A\u56FE"
    ],
    "deliverable": "\u81EA\u52A8\u7EED\u8D39\u6838\u5BF9\u8868\u4E0E\u9010\u9879\u53D6\u6D88\u6307\u5F15",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u627E\u51FA\u5FD8\u8BB0\u7684\u81EA\u52A8\u7EED\u8D39\uFF0C\u6574\u7406\u53D6\u6D88\u8DEF\u5F84\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u8BA2\u9605\u6E05\u5355\u6216\u8131\u654F\u8D26\u5355\u622A\u56FE\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u81EA\u52A8\u7EED\u8D39\u6838\u5BF9\u8868\u4E0E\u9010\u9879\u53D6\u6D88\u6307\u5F15\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592909:00\u68C0\u67E5\u5DF2\u63D0\u4F9B\u6E05\u5355\u4E2D\u7684\u8FD1\u671F\u7EED\u8D39\uFF1B\u5168\u90E8\u9009\u5B9A\u4E8B\u9879\u5904\u7406\u5B8C\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u8BA2\u9605\u4E0E\u81EA\u52A8\u7EED\u8D39\u6E05\u5355\uFF1A\u8BB0\u5F55\u8D39\u7528\u3001\u7EED\u8D39\u65E5\u671F\u3001\u53D6\u6D88\u8DEF\u5F84\u53CA\u6838\u5B9E\u7ED3\u679C\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u5728\u5DF2\u77E5\u7684\u7EED\u8D39\u65E5\u524D\u63D0\u9192\u6838\u5BF9\uFF0C\u8DDF\u8FDB\u5C1A\u672A\u5904\u7406\u7684\u8BA2\u9605\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u6838\u5BF9\u8D26\u5355\u548C\u8BA2\u9605\uFF0C\u518D\u9010\u9879\u786E\u8BA4\u4FDD\u7559\u6216\u53D6\u6D88\uFF1B\u5916\u90E8\u53D6\u6D88\u9700\u5B9E\u9645\u56DE\u6267\uFF0C\u540E\u7EED\u5230\u8D26\u6216\u7EED\u8D39\u72B6\u6001\u53E6\u884C\u6838\u5BF9\u3002",
    "mode": "mixed",
    "completionRule": "\u9009\u5B9A\u8BA2\u9605\u5747\u6838\u5B9E\u4FDD\u7559\u6216\u5B9E\u9645\u53D6\u6D88\u540E\uFF0C\u53EF\u786E\u8BA4\u672C\u6279\u6E05\u7406\u5B8C\u6210\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592909:00\u68C0\u67E5\u5DF2\u63D0\u4F9B\u6E05\u5355\u4E2D\u7684\u8FD1\u671F\u7EED\u8D39\uFF1B\u5168\u90E8\u9009\u5B9A\u4E8B\u9879\u5904\u7406\u5B8C\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 9 * * *"
  },
  {
    "id": "general-04",
    "category": "\u8D22\u52A1\u7BA1\u7406",
    "icon": "\u{1F4B0}",
    "title": "\u5B9A\u4E00\u4E2A\u50A8\u84C4\u76EE\u6807\uFF0C\u770B\u770B\u94B1\u82B1\u5230\u54EA\u91CC\u4E86\u3002",
    "description": "\u544A\u8BC9\u6211\u76EE\u6807\u91D1\u989D\u3001\u8BA1\u5212\u65E5\u671F\u548C\u6536\u652F\u60C5\u51B5\uFF0C\u6211\u4F1A\u6574\u7406\u50A8\u84C4\u8FDB\u5EA6\u4E0E\u652F\u51FA\u5206\u7C7B\uFF0C\u627E\u51FA\u5F71\u54CD\u76EE\u6807\u7684\u4E3B\u8981\u5F00\u652F\uFF0C\u7ED9\u51FA\u53EF\u8C03\u6574\u7684\u9884\u7B97\u65B9\u6848\u3002",
    "needs": [
      "\u50A8\u84C4\u76EE\u6807\u91D1\u989D\u4E0E\u65E5\u671F",
      "\u6536\u5165\u3001\u56FA\u5B9A\u652F\u51FA\u53CA\u8FD1\u671F\u6D41\u6C34"
    ],
    "deliverable": "\u50A8\u84C4\u8FDB\u5EA6\u8868\u3001\u6536\u652F\u5206\u7C7B\u548C\u9884\u7B97\u8C03\u6574\u5EFA\u8BAE",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u5B9A\u4E00\u4E2A\u50A8\u84C4\u76EE\u6807\uFF0C\u770B\u770B\u94B1\u82B1\u5230\u54EA\u91CC\u4E86\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u50A8\u84C4\u76EE\u6807\u91D1\u989D\u4E0E\u65E5\u671F\u3001\u6536\u5165\u3001\u56FA\u5B9A\u652F\u51FA\u53CA\u8FD1\u671F\u6D41\u6C34\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u50A8\u84C4\u8FDB\u5EA6\u8868\u3001\u6536\u652F\u5206\u7C7B\u548C\u9884\u7B97\u8C03\u6574\u5EFA\u8BAE\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u5468\u65E519:00\u56DE\u987E\u7528\u6237\u5DF2\u63D0\u4F9B\u7684\u6536\u652F\u548C\u50A8\u84C4\u66F4\u65B0\uFF1B\u8FBE\u5230\u76EE\u6807\u6216\u7528\u6237\u505C\u6B62\u540E\u7ED3\u675F\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u50A8\u84C4\u8FDB\u5EA6\u4E0E\u6536\u652F\u770B\u677F\uFF1A\u5C55\u793A\u76EE\u6807\u91D1\u989D\u3001\u5F53\u524D\u8FDB\u5EA6\u3001\u652F\u51FA\u5206\u7C7B\u548C\u9884\u7B97\u8C03\u6574\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5468\u671F\u504F\u597D\u6216\u9ED8\u8BA4\u5468\u671F\u56DE\u987E\u4F60\u63D0\u4F9B\u7684\u6536\u652F\u4E0E\u50A8\u84C4\u66F4\u65B0\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u76EE\u6807\u548C\u8D44\u6599\u8303\u56F4\uFF0C\u518D\u5EFA\u7ACB\u8FDB\u5EA6\u8868\uFF1B\u6BCF\u6B21\u65B0\u589E\u6570\u636E\u6CE8\u660E\u6765\u6E90\u4E0E\u65E5\u671F\uFF0C\u4E0D\u63A8\u6D4B\u672A\u63D0\u4F9B\u7684\u8D26\u6237\u53D8\u5316\u3002",
    "mode": "ongoing",
    "completionRule": "\u76EE\u6807\u91D1\u989D\u8FBE\u6210\u5E76\u6838\u5B9E\u540E\u6536\u5C3E\uFF1B\u4E00\u6B21\u9884\u7B97\u5EFA\u8BAE\u4EC5\u7B97\u9636\u6BB5\u4EA7\u51FA\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u5468\u65E519:00\u56DE\u987E\u7528\u6237\u5DF2\u63D0\u4F9B\u7684\u6536\u652F\u548C\u50A8\u84C4\u66F4\u65B0\uFF1B\u8FBE\u5230\u76EE\u6807\u6216\u7528\u6237\u505C\u6B62\u540E\u7ED3\u675F\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 19 * * 0"
  },
  {
    "id": "general-05",
    "category": "\u6548\u7387\u63D0\u5347",
    "icon": "\u{1F4E5}",
    "title": "\u628A\u5176\u4ED6\u4EBA\u5DE5\u667A\u80FD\u52A9\u624B\u4E86\u89E3\u7684\u60C5\u51B5\u5E26\u8FC7\u6765\uFF0C\u63A5\u7740\u5F80\u4E0B\u505A\u3002",
    "description": "\u6211\u4F1A\u7ED9\u4F60\u4E00\u6BB5\u53EF\u590D\u5236\u7684\u6574\u7406\u63D0\u793A\u8BCD\uFF0C\u8BA9\u539F\u6765\u7684\u52A9\u624B\u6C47\u603B\u9879\u76EE\u80CC\u666F\u3001\u5DE5\u4F5C\u4E60\u60EF\u548C\u672A\u5B8C\u6210\u4E8B\u9879\u3002\u628A\u7ED3\u679C\u8D34\u56DE\u6765\u540E\uFF0C\u6211\u4EEC\u4E00\u8D77\u6838\u5BF9\uFF0C\u786E\u8BA4\u54EA\u4E9B\u5185\u5BB9\u9700\u8981\u4FDD\u7559\uFF0C\u518D\u5199\u5165\u8BB0\u5FC6\u3002",
    "needs": [
      "\u539F\u52A9\u624B\u5BFC\u51FA\u7684\u80CC\u666F\u6458\u8981\u6216\u5BF9\u8BDD\u6574\u7406"
    ],
    "deliverable": "\u7ECF\u4F60\u6838\u5BF9\u7684\u80CC\u666F\u6458\u8981\u4E0E\u5F85\u4FDD\u7559\u8BB0\u5FC6\u6E05\u5355",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u5176\u4ED6\u4EBA\u5DE5\u667A\u80FD\u52A9\u624B\u4E86\u89E3\u7684\u60C5\u51B5\u5E26\u8FC7\u6765\uFF0C\u63A5\u7740\u5F80\u4E0B\u505A\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u539F\u52A9\u624B\u5BFC\u51FA\u7684\u80CC\u666F\u6458\u8981\u6216\u5BF9\u8BDD\u6574\u7406\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u7ECF\u4F60\u6838\u5BF9\u7684\u80CC\u666F\u6458\u8981\u4E0E\u5F85\u4FDD\u7559\u8BB0\u5FC6\u6E05\u5355\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u4E00\u6B21\u6027\u6574\u7406\u4E0E\u6838\u5BF9\u8BB0\u5FC6\uFF1B\u4E0D\u521B\u5EFA\u65E0\u610F\u4E49\u7684\u5468\u671F\u4EFB\u52A1\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u80CC\u666F\u6458\u8981\u4E0E\u8BB0\u5FC6\u5019\u9009\uFF1A\u6574\u7406\u9879\u76EE\u3001\u4E60\u60EF\u3001\u672A\u5B8C\u6210\u4E8B\u9879\u53CA\u5F85\u6838\u5BF9\u7684\u4FE1\u606F\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u8BB0\u5FC6\u6574\u7406",
        "description": "\u7ECF\u4F60\u786E\u8BA4\u540E\u4FDD\u5B58\u9700\u8981\u4FDD\u7559\u7684\u5185\u5BB9\uFF0C\u53EF\u7EA0\u6B63\u6216\u6392\u9664\u8FC7\u65F6\u4FE1\u606F\u3002",
        "kind": "action"
      }
    ],
    "howItWorks": "\u5148\u63D0\u4F9B\u4E00\u6BB5\u5BFC\u51FA\u63D0\u793A\u8BCD\uFF0C\u518D\u6838\u5BF9\u4F60\u5E26\u56DE\u7684\u6458\u8981\uFF1B\u786E\u8BA4\u5177\u4F53\u5185\u5BB9\u540E\u624D\u5199\u5165\u8BB0\u5FC6\u5E76\u8BFB\u56DE\u9A8C\u8BC1\u3002",
    "mode": "once",
    "completionRule": "\u6458\u8981\u6838\u5BF9\u5B8C\u6210\uFF0C\u786E\u8BA4\u4FDD\u7559\u7684\u4FE1\u606F\u5B9E\u9645\u5199\u5165\u5E76\u53EF\u8BFB\u56DE\u3002",
    "defaultFollowUp": "\u4E00\u6B21\u6027\u6574\u7406\u4E0E\u6838\u5BF9\u8BB0\u5FC6\uFF1B\u4E0D\u521B\u5EFA\u65E0\u610F\u4E49\u7684\u5468\u671F\u4EFB\u52A1\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-06",
    "category": "\u6548\u7387\u63D0\u5347",
    "icon": "\u{1F4F0}",
    "title": "\u628A\u4ECA\u5929\u7684\u5B89\u6392\u6574\u7406\u6210\u4E00\u4EFD\u6668\u95F4\u7B80\u62A5\u3002",
    "description": "\u628A\u65E5\u7A0B\u3001\u5F85\u529E\u548C\u9700\u8981\u5173\u6CE8\u7684\u90AE\u4EF6\u4EA4\u7ED9\u6211\uFF0C\u6211\u4F1A\u6574\u7406\u4F1A\u8BAE\u3001\u622A\u6B62\u65E5\u671F\u3001\u5F85\u56DE\u590D\u4E8B\u9879\uFF0C\u4EE5\u53CA\u4F60\u63D0\u4F9B\u7684\u5FEB\u9012\u6216\u5929\u6C14\u4FE1\u606F\uFF0C\u505A\u6210\u4E00\u9875\u901F\u89C8\u3002\u9ED8\u8BA4\u6BCF\u5929\u65E9\u4E0A\u63A8\u9001\uFF0C\u4F18\u5148\u6CBF\u7528\u5DF2\u6709\u63D0\u9192\u65F6\u95F4\u3002",
    "needs": [
      "\u5F53\u65E5\u65E5\u7A0B\u548C\u5F85\u529E",
      "\u9700\u8981\u7EB3\u5165\u7684\u90AE\u4EF6\u3001\u5FEB\u9012\u6216\u5929\u6C14\u4FE1\u606F"
    ],
    "deliverable": "\u4E00\u9875\u6668\u95F4\u7B80\u62A5\u4E0E\u5F53\u5929\u4F18\u5148\u4E8B\u9879",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u4ECA\u5929\u7684\u5B89\u6392\u6574\u7406\u6210\u4E00\u4EFD\u6668\u95F4\u7B80\u62A5\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u5F53\u65E5\u65E5\u7A0B\u548C\u5F85\u529E\u3001\u9700\u8981\u7EB3\u5165\u7684\u90AE\u4EF6\u3001\u5FEB\u9012\u6216\u5929\u6C14\u4FE1\u606F\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u4E00\u9875\u6668\u95F4\u7B80\u62A5\u4E0E\u5F53\u5929\u4F18\u5148\u4E8B\u9879\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592908:00\u751F\u6210\u6668\u95F4\u7B80\u62A5\uFF1B\u5DF2\u6709\u504F\u597D\u4F18\u5148\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u4E00\u9875\u6668\u95F4\u7B80\u62A5\uFF1A\u6C47\u603B\u65E5\u7A0B\u3001\u5F85\u529E\u3001\u5F85\u56DE\u590D\u4E8B\u9879\u548C\u4F60\u5E0C\u671B\u5173\u6CE8\u7684\u4FE1\u606F\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u7EA6\u5B9A\u65F6\u95F4\u751F\u6210\u65B0\u4E00\u671F\u7B80\u62A5\uFF0C\u91CD\u8981\u53D8\u5316\u65F6\u518D\u63D0\u9192\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u8D44\u6599\u6765\u6E90\u3001\u7B80\u62A5\u8303\u56F4\u548C\u65F6\u95F4\uFF0C\u518D\u521B\u5EFA\u771F\u5B9E\u5B9A\u65F6\u4EFB\u52A1\uFF1B\u6BCF\u671F\u4FDD\u7559\u66F4\u65B0\u65F6\u95F4\u548C\u6765\u6E90\u3002",
    "mode": "ongoing",
    "completionRule": "\u6BCF\u4EFD\u7B80\u62A5\u53EF\u5B8C\u6210\u4E00\u6B21\u8FD0\u884C\uFF1B\u6BCF\u65E5\u7B80\u62A5\u6301\u7EED\u6709\u6548\uFF0C\u76F4\u5230\u4F60\u505C\u6B62\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592908:00\u751F\u6210\u6668\u95F4\u7B80\u62A5\uFF1B\u5DF2\u6709\u504F\u597D\u4F18\u5148\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 8 * * *"
  },
  {
    "id": "general-07",
    "category": "\u6548\u7387\u63D0\u5347",
    "icon": "\u{1F4C5}",
    "title": "\u628A\u6536\u4EF6\u7BB1\u91CC\u7684\u4E8B\u60C5\uFF0C\u6392\u8FDB\u4ECA\u5929\u7684\u8BA1\u5212\u3002",
    "description": "\u63D0\u4F9B\u76F8\u5173\u90AE\u4EF6\u6216\u5DF2\u6388\u6743\u7684\u90AE\u7BB1\u5185\u5BB9\uFF0C\u6211\u4F1A\u627E\u51FA\u5F85\u56DE\u590D\u7684\u95EE\u9898\u3001\u4F1A\u8BAE\u9080\u7EA6\u548C\u4E34\u8FD1\u622A\u6B62\u7684\u4E8B\u9879\uFF0C\u7ED3\u5408\u4F60\u7684\u7A7A\u95F2\u65F6\u6BB5\u6392\u51FA\u4E00\u5929\u8BA1\u5212\u3002\u9700\u8981\u5199\u5165\u65E5\u5386\u7684\u5B89\u6392\uFF0C\u5148\u4EA4\u4F60\u786E\u8BA4\u3002",
    "needs": [
      "\u76F8\u5173\u90AE\u4EF6\u5185\u5BB9",
      "\u5F53\u65E5\u65E5\u7A0B\u4E0E\u53EF\u5B89\u6392\u65F6\u6BB5"
    ],
    "deliverable": "\u5F53\u5929\u8BA1\u5212\u3001\u5F85\u56DE\u590D\u6E05\u5355\u548C\u5F85\u786E\u8BA4\u65E5\u5386\u5B89\u6392",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u6536\u4EF6\u7BB1\u91CC\u7684\u4E8B\u60C5\uFF0C\u6392\u8FDB\u4ECA\u5929\u7684\u8BA1\u5212\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u76F8\u5173\u90AE\u4EF6\u5185\u5BB9\u3001\u5F53\u65E5\u65E5\u7A0B\u4E0E\u53EF\u5B89\u6392\u65F6\u6BB5\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5F53\u5929\u8BA1\u5212\u3001\u5F85\u56DE\u590D\u6E05\u5355\u548C\u5F85\u786E\u8BA4\u65E5\u5386\u5B89\u6392\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592908:30\u6574\u7406\u6307\u5B9A\u6536\u4EF6\u7BB1\u4E0E\u5F53\u5929\u8BA1\u5212\uFF1B\u5DF2\u6709\u504F\u597D\u4F18\u5148\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u5F53\u5929\u8BA1\u5212\u4E0E\u90AE\u4EF6\u5F85\u529E\uFF1A\u6574\u7406\u5F85\u56DE\u590D\u95EE\u9898\u3001\u4F1A\u8BAE\u9080\u7EA6\u3001\u622A\u6B62\u65E5\u671F\u548C\u7A7A\u95F2\u65F6\u6BB5\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u9891\u7387\u6574\u7406\u540E\u7EED\u65B0\u90AE\u4EF6\u4E0E\u5B89\u6392\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u8BFB\u53D6\u6307\u5B9A\u90AE\u4EF6\u548C\u65E5\u7A0B\uFF0C\u751F\u6210\u8BA1\u5212\u8349\u7A3F\uFF1B\u5199\u5165\u65E5\u5386\u6216\u53D1\u9001\u56DE\u590D\u65F6\uFF0C\u6309\u4F60\u786E\u8BA4\u7684\u5177\u4F53\u64CD\u4F5C\u6267\u884C\u3002",
    "mode": "mixed",
    "completionRule": "\u5F53\u5929\u8BA1\u5212\u7ECF\u786E\u8BA4\u53EF\u5B8C\u6210\uFF1B\u90AE\u4EF6\u56DE\u590D\u548C\u65E5\u5386\u5199\u5165\u5206\u522B\u6838\u9A8C\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592908:30\u6574\u7406\u6307\u5B9A\u6536\u4EF6\u7BB1\u4E0E\u5F53\u5929\u8BA1\u5212\uFF1B\u5DF2\u6709\u504F\u597D\u4F18\u5148\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "30 8 * * *"
  },
  {
    "id": "general-08",
    "category": "\u6548\u7387\u63D0\u5347",
    "icon": "\u{1F319}",
    "title": "\u7761\u524D\u4EA4\u7ED9\u6211\u4E00\u4EF6\u4E8B\uFF0C\u65E9\u4E0A\u770B\u8FDB\u5C55\u3002",
    "description": "\u628A\u603B\u88AB\u63A8\u8FDF\u7684\u8D44\u6599\u6574\u7406\u3001\u8C03\u7814\u6216\u6587\u7A3F\u4EA4\u7ED9\u6211\uFF0C\u5148\u7EA6\u5B9A\u8303\u56F4\u3001\u5B8C\u6210\u65F6\u95F4\u548C\u5141\u8BB8\u6267\u884C\u7684\u6B65\u9AA4\u3002\u6211\u4F1A\u8BF4\u660E\u54EA\u4E9B\u53EF\u4EE5\u7EE7\u7EED\u63A8\u8FDB\u3001\u54EA\u4E9B\u9700\u8981\u4F60\u51B3\u5B9A\uFF0C\u5E76\u5B89\u6392\u6B21\u65E5\u67E5\u770B\u8FDB\u5C55\u3002",
    "needs": [
      "\u4EFB\u52A1\u76EE\u6807\u4E0E\u5DF2\u6709\u6750\u6599",
      "\u5B8C\u6210\u65F6\u95F4\u3001\u6267\u884C\u8303\u56F4\u53CA\u9700\u8981\u786E\u8BA4\u7684\u4E8B\u9879"
    ],
    "deliverable": "\u4EFB\u52A1\u63A8\u8FDB\u5B89\u6392\u4E0E\u6668\u95F4\u8FDB\u5C55\u62A5\u544A",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u7761\u524D\u4EA4\u7ED9\u6211\u4E00\u4EF6\u4E8B\uFF0C\u65E9\u4E0A\u770B\u8FDB\u5C55\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u4EFB\u52A1\u76EE\u6807\u4E0E\u5DF2\u6709\u6750\u6599\u3001\u5B8C\u6210\u65F6\u95F4\u3001\u6267\u884C\u8303\u56F4\u53CA\u9700\u8981\u786E\u8BA4\u7684\u4E8B\u9879\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u4EFB\u52A1\u63A8\u8FDB\u5B89\u6392\u4E0E\u6668\u95F4\u8FDB\u5C55\u62A5\u544A\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u6309\u5DF2\u77E5\u622A\u6B62\u65F6\u95F4\u63A8\u8FDB\uFF0C\u9ED8\u8BA4\u6B21\u65E508:00\u6C47\u62A5\uFF1B\u4EA4\u4ED8\u8FBE\u6807\u540E\u7ED3\u675F\u672C\u6B21\u4EFB\u52A1\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u4EFB\u52A1\u8BA1\u5212\u4E0E\u6668\u95F4\u8FDB\u5C55\uFF1A\u8BB0\u5F55\u76EE\u6807\u3001\u6267\u884C\u8303\u56F4\u3001\u5DF2\u5B8C\u6210\u6B65\u9AA4\u548C\u5F85\u4F60\u51B3\u5B9A\u7684\u4E8B\u9879\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u7EA6\u5B9A\u65F6\u95F4\u68C0\u67E5\u8FDB\u5EA6\u5E76\u751F\u6210\u6C47\u62A5\uFF1B\u6761\u4EF6\u4E0D\u8DB3\u65F6\u505C\u6B62\u7B49\u5F85\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u5B9A\u4E49\u9A8C\u6536\u6807\u51C6\u548C\u5141\u8BB8\u6267\u884C\u7684\u8303\u56F4\uFF0C\u518D\u5B89\u6392\u540E\u53F0\u6267\u884C\uFF1B\u6B21\u65E5\u6C47\u62A5\u771F\u5B9E\u8FDB\u5C55\u3001\u7ED3\u679C\u548C\u963B\u585E\u3002",
    "mode": "mixed",
    "completionRule": "\u53EA\u6709\u7EA6\u5B9A\u4EA4\u4ED8\u8FBE\u5230\u9A8C\u6536\u6807\u51C6\u624D\u5B8C\u6210\uFF0C\u53D1\u9001\u65E9\u62A5\u672C\u8EAB\u4E0D\u4EE3\u8868\u76EE\u6807\u5B8C\u6210\u3002",
    "defaultFollowUp": "\u6309\u5DF2\u77E5\u622A\u6B62\u65F6\u95F4\u63A8\u8FDB\uFF0C\u9ED8\u8BA4\u6B21\u65E508:00\u6C47\u62A5\uFF1B\u4EA4\u4ED8\u8FBE\u6807\u540E\u7ED3\u675F\u672C\u6B21\u4EFB\u52A1\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-09",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F310}",
    "title": "\u62FF\u51FA\u5BBD\u5E26\u8D26\u5355\uFF0C\u770B\u770B\u6709\u6CA1\u6709\u66F4\u5408\u9002\u7684\u5957\u9910\u3002",
    "description": "\u63D0\u4F9B\u8FD0\u8425\u5546\u3001\u6240\u5728\u57CE\u5E02\u3001\u5F53\u524D\u8D44\u8D39\u548C\u5408\u7EA6\u4FE1\u606F\uFF0C\u6211\u4F1A\u6BD4\u8F83\u5F53\u5730\u53EF\u529E\u7406\u7684\u5BBD\u5E26\u6216\u878D\u5408\u5957\u9910\uFF0C\u6838\u5BF9\u4F18\u60E0\u671F\u9650\u3001\u7EED\u7EA6\u4EF7\u683C\u3001\u8BBE\u5907\u8D39\u7528\u548C\u8FDD\u7EA6\u6210\u672C\uFF0C\u518D\u6574\u7406\u54A8\u8BE2\u8BDD\u672F\u3002",
    "needs": [
      "\u57CE\u5E02\u3001\u8FD0\u8425\u5546\u548C\u5F53\u524D\u5957\u9910",
      "\u6708\u8D39\u3001\u5408\u7EA6\u671F\u9650\u53CA\u5BBD\u5E26\u9700\u6C42"
    ],
    "deliverable": "\u5957\u9910\u5BF9\u6BD4\u8868\u3001\u603B\u6210\u672C\u6838\u5BF9\u4E0E\u54A8\u8BE2\u8BDD\u672F",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u62FF\u51FA\u5BBD\u5E26\u8D26\u5355\uFF0C\u770B\u770B\u6709\u6CA1\u6709\u66F4\u5408\u9002\u7684\u5957\u9910\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u57CE\u5E02\u3001\u8FD0\u8425\u5546\u548C\u5F53\u524D\u5957\u9910\u3001\u6708\u8D39\u3001\u5408\u7EA6\u671F\u9650\u53CA\u5BBD\u5E26\u9700\u6C42\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5957\u9910\u5BF9\u6BD4\u8868\u3001\u603B\u6210\u672C\u6838\u5BF9\u4E0E\u54A8\u8BE2\u8BDD\u672F\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u4E00\u6B21\u6027\u5B8C\u6210\u8D26\u5355\u4E0E\u5957\u9910\u6BD4\u8F83\uFF1B\u5B58\u5728\u660E\u786E\u7684\u5916\u90E8\u5F85\u56DE\u590D\u9879\u65F6\u518D\u505A\u6709\u671F\u9650\u7684\u8DDF\u8FDB\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u5BBD\u5E26\u5957\u9910\u4E0E\u8D39\u7528\u5BF9\u7167\uFF1A\u6BD4\u8F83\u5F53\u524D\u65B9\u6848\u3001\u5019\u9009\u8D44\u8D39\u3001\u5408\u7EA6\u671F\u9650\u4E0E\u603B\u6210\u672C\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u4E8B\u9879\u8DDF\u8FDB",
        "description": "\u4F60\u786E\u8BA4\u540E\u7EE7\u7EED\u6838\u5B9E\u62A5\u4EF7\u3001\u6C9F\u901A\u5185\u5BB9\u6216\u5B9E\u9645\u529E\u7406\u7ED3\u679C\u3002",
        "kind": "action"
      }
    ],
    "howItWorks": "\u5148\u6574\u7406\u5F53\u524D\u8D26\u5355\u4E0E\u9700\u6C42\uFF0C\u518D\u67E5\u8BE2\u53EF\u6838\u5B9E\u7684\u65B9\u6848\uFF1B\u672A\u7ECF\u786E\u8BA4\u4E0D\u529E\u7406\u53D8\u66F4\uFF0C\u4E0D\u628A\u54A8\u8BE2\u62A5\u4EF7\u5F53\u4F5C\u5957\u9910\u5DF2\u53D8\u66F4\u3002",
    "mode": "once",
    "completionRule": "\u7EA6\u5B9A\u7684\u65B9\u6848\u6BD4\u8F83\u4EA4\u4ED8\u540E\u53EF\u786E\u8BA4\u5B8C\u6210\uFF1B\u5982\u8981\u6C42\u529E\u7406\uFF0C\u4EE5\u5B9E\u9645\u53D8\u66F4\u7ED3\u679C\u4E3A\u51C6\u3002",
    "defaultFollowUp": "\u4E00\u6B21\u6027\u5B8C\u6210\u8D26\u5355\u4E0E\u5957\u9910\u6BD4\u8F83\uFF1B\u5B58\u5728\u660E\u786E\u7684\u5916\u90E8\u5F85\u56DE\u590D\u9879\u65F6\u518D\u505A\u6709\u671F\u9650\u7684\u8DDF\u8FDB\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-10",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F697}",
    "title": "\u540C\u6837\u7684\u4FDD\u969C\uFF0C\u8F66\u9669\u8FD8\u6709\u6CA1\u6709\u66F4\u5408\u9002\u7684\u62A5\u4EF7\uFF1F",
    "description": "\u628A\u4FDD\u5355\u548C\u7EED\u4FDD\u62A5\u4EF7\u53D1\u7ED9\u6211\uFF0C\u6211\u4F1A\u9010\u9879\u5BF9\u7167\u4EA4\u5F3A\u9669\u3001\u5546\u4E1A\u9669\u3001\u4FDD\u989D\u3001\u514D\u8D54\u7EA6\u5B9A\u548C\u9644\u52A0\u670D\u52A1\u3002\u5148\u770B\u4FDD\u969C\u662F\u5426\u4E00\u81F4\uFF0C\u518D\u6BD4\u8F83\u603B\u4EF7\u548C\u53EF\u6838\u5B9E\u7684\u4F18\u60E0\u3002",
    "needs": [
      "\u4FDD\u5355\u4E0E\u7EED\u4FDD\u62A5\u4EF7",
      "\u8F66\u8F86\u60C5\u51B5\u53CA\u5E0C\u671B\u4FDD\u7559\u7684\u4FDD\u969C"
    ],
    "deliverable": "\u4FDD\u969C\u5BF9\u7167\u8868\u3001\u62A5\u4EF7\u5DEE\u5F02\u548C\u5F85\u95EE\u4FDD\u9669\u516C\u53F8\u7684\u95EE\u9898",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u540C\u6837\u7684\u4FDD\u969C\uFF0C\u8F66\u9669\u8FD8\u6709\u6CA1\u6709\u66F4\u5408\u9002\u7684\u62A5\u4EF7\uFF1F\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u4FDD\u5355\u4E0E\u7EED\u4FDD\u62A5\u4EF7\u3001\u8F66\u8F86\u60C5\u51B5\u53CA\u5E0C\u671B\u4FDD\u7559\u7684\u4FDD\u969C\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u4FDD\u969C\u5BF9\u7167\u8868\u3001\u62A5\u4EF7\u5DEE\u5F02\u548C\u5F85\u95EE\u4FDD\u9669\u516C\u53F8\u7684\u95EE\u9898\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u4F7F\u7528\u4FDD\u5355\u5DF2\u77E5\u5230\u671F\u65E5\uFF0C\u5728\u5230\u671F\u524D7\u5929\u768409:00\u63D0\u9192\uFF1B\u7F3A\u5C11\u5FC5\u8981\u5230\u671F\u4FE1\u606F\u65F6\u96C6\u4E2D\u95EE\u4E00\u6B21\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u8F66\u9669\u4FDD\u969C\u4E0E\u62A5\u4EF7\u5BF9\u7167\uFF1A\u5217\u51FA\u540C\u7B49\u4FDD\u969C\u4E0B\u7684\u5DEE\u5F02\u3001\u8D39\u7528\u4E0E\u5F85\u6838\u5B9E\u6761\u6B3E\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u5728\u5DF2\u77E5\u7684\u7EED\u4FDD\u65E5\u524D\u63D0\u9192\u6838\u5BF9\u6700\u65B0\u62A5\u4EF7\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u660E\u786E\u6BD4\u8F83\u8303\u56F4\uFF0C\u518D\u6838\u5BF9\u4FDD\u969C\u4E0E\u62A5\u4EF7\uFF1B\u6295\u4FDD\u3001\u4ED8\u6B3E\u548C\u751F\u6548\u60C5\u51B5\u9700\u5355\u72EC\u786E\u8BA4\u53CA\u6838\u5B9E\u3002",
    "mode": "mixed",
    "completionRule": "\u6BD4\u8F83\u4EFB\u52A1\u4EE5\u4EA4\u4ED8\u5BF9\u7167\u8868\u4E3A\u51C6\uFF1B\u6295\u4FDD\u4EFB\u52A1\u987B\u6838\u5B9E\u4FDD\u5355\u751F\u6548\u3002",
    "defaultFollowUp": "\u4F7F\u7528\u4FDD\u5355\u5DF2\u77E5\u5230\u671F\u65E5\uFF0C\u5728\u5230\u671F\u524D7\u5929\u768409:00\u63D0\u9192\uFF1B\u7F3A\u5C11\u5FC5\u8981\u5230\u671F\u4FE1\u606F\u65F6\u96C6\u4E2D\u95EE\u4E00\u6B21\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-11",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F527}",
    "title": "\u62CD\u4E0B\u4FEE\u8F66\u62A5\u4EF7\uFF0C\u6211\u5E2E\u4F60\u9010\u9879\u770B\u660E\u767D\u3002",
    "description": "\u63D0\u4F9B\u8F66\u8F86\u4FE1\u606F\u548C\u7EF4\u4FEE\u62A5\u4EF7\uFF0C\u6211\u4F1A\u62C6\u5206\u5DE5\u65F6\u3001\u914D\u4EF6\u4E0E\u9644\u52A0\u9879\u76EE\uFF0C\u6807\u51FA\u91CD\u590D\u3001\u542B\u7CCA\u6216\u9700\u8981\u89E3\u91CA\u7684\u8D39\u7528\uFF0C\u5E76\u5E2E\u4F60\u6574\u7406\u5411\u53E6\u4E00\u5BB6\u7EF4\u4FEE\u5E97\u8BE2\u4EF7\u7684\u95EE\u9898\u3002",
    "needs": [
      "\u8F66\u578B\u3001\u6545\u969C\u63CF\u8FF0\u4E0E\u7EF4\u4FEE\u62A5\u4EF7"
    ],
    "deliverable": "\u62A5\u4EF7\u9879\u76EE\u8BF4\u660E\u3001\u5F85\u6838\u5B9E\u8D39\u7528\u548C\u4E8C\u6B21\u8BE2\u4EF7\u6E05\u5355",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u62CD\u4E0B\u4FEE\u8F66\u62A5\u4EF7\uFF0C\u6211\u5E2E\u4F60\u9010\u9879\u770B\u660E\u767D\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u8F66\u578B\u3001\u6545\u969C\u63CF\u8FF0\u4E0E\u7EF4\u4FEE\u62A5\u4EF7\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u62A5\u4EF7\u9879\u76EE\u8BF4\u660E\u3001\u5F85\u6838\u5B9E\u8D39\u7528\u548C\u4E8C\u6B21\u8BE2\u4EF7\u6E05\u5355\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u4E00\u6B21\u6027\u5B8C\u6210\u62A5\u4EF7\u89E3\u91CA\u548C\u7EA6\u5B9A\u7684\u4E8C\u6B21\u8BE2\u4EF7\u6574\u7406\uFF1B\u4E0D\u5EFA\u7ACB\u65E0\u671F\u9650\u5B9A\u65F6\u68C0\u67E5\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u7EF4\u4FEE\u62A5\u4EF7\u62C6\u5206\u4E0E\u8BE2\u4EF7\u6E05\u5355\uFF1A\u89E3\u91CA\u5DE5\u65F6\u3001\u914D\u4EF6\u3001\u9644\u52A0\u9879\u76EE\u53CA\u5F85\u6838\u5B9E\u8D39\u7528\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u4E8B\u9879\u8DDF\u8FDB",
        "description": "\u6536\u5230\u65B0\u62A5\u4EF7\u540E\u8865\u5145\u6BD4\u8F83\uFF0C\u8BB0\u5F55\u5C1A\u672A\u89E3\u91CA\u7684\u9879\u76EE\u3002",
        "kind": "action"
      }
    ],
    "howItWorks": "\u5148\u6838\u5BF9\u8F66\u578B\u3001\u6545\u969C\u4E0E\u62A5\u4EF7\uFF0C\u518D\u6574\u7406\u95EE\u9898\u548C\u4E8C\u6B21\u8BE2\u4EF7\u8349\u7A3F\uFF1B\u8054\u7CFB\u7EF4\u4FEE\u5E97\u6216\u9884\u7EA6\u9700\u4F60\u786E\u8BA4\u3002",
    "mode": "once",
    "completionRule": "\u62A5\u4EF7\u8BF4\u660E\u548C\u7EA6\u5B9A\u7684\u6BD4\u8F83\u7ED3\u679C\u4EA4\u4ED8\u5E76\u786E\u8BA4\uFF1B\u4E0D\u58F0\u79F0\u8F66\u8F86\u5DF2\u4FEE\u590D\u3002",
    "defaultFollowUp": "\u4E00\u6B21\u6027\u5B8C\u6210\u62A5\u4EF7\u89E3\u91CA\u548C\u7EA6\u5B9A\u7684\u4E8C\u6B21\u8BE2\u4EF7\u6574\u7406\uFF1B\u4E0D\u5EFA\u7ACB\u65E0\u671F\u9650\u5B9A\u65F6\u68C0\u67E5\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-12",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F3F7}\uFE0F",
    "title": "\u521A\u4E70\u7684\u5546\u54C1\u964D\u4EF7\u4E86\uFF1F\u770B\u770B\u80FD\u4E0D\u80FD\u7533\u8BF7\u4EF7\u4FDD\u3002",
    "description": "\u63D0\u4F9B\u8BA2\u5355\u3001\u8D2D\u4E70\u65F6\u95F4\u3001\u5F53\u524D\u4EF7\u683C\u548C\u5E73\u53F0\u4EF7\u4FDD\u89C4\u5219\uFF0C\u6211\u4F1A\u6838\u5BF9\u662F\u5426\u8FD8\u5728\u7533\u8BF7\u671F\u3001\u4F18\u60E0\u662F\u5426\u53EF\u53E0\u52A0\uFF0C\u6574\u7406\u5DEE\u4EF7\u4E0E\u6240\u9700\u51ED\u8BC1\uFF0C\u5E2E\u4F60\u51C6\u5907\u7533\u8BF7\u5185\u5BB9\u3002",
    "needs": [
      "\u8BA2\u5355\u622A\u56FE\u4E0E\u8D2D\u4E70\u65F6\u95F4",
      "\u5F53\u524D\u4EF7\u683C\u53CA\u5E73\u53F0\u4EF7\u4FDD\u89C4\u5219"
    ],
    "deliverable": "\u4EF7\u4FDD\u8D44\u683C\u6838\u5BF9\u3001\u5DEE\u4EF7\u8BA1\u7B97\u4E0E\u7533\u8BF7\u8349\u7A3F",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u521A\u4E70\u7684\u5546\u54C1\u964D\u4EF7\u4E86\uFF1F\u770B\u770B\u80FD\u4E0D\u80FD\u7533\u8BF7\u4EF7\u4FDD\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u8BA2\u5355\u622A\u56FE\u4E0E\u8D2D\u4E70\u65F6\u95F4\u3001\u5F53\u524D\u4EF7\u683C\u53CA\u5E73\u53F0\u4EF7\u4FDD\u89C4\u5219\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u4EF7\u4FDD\u8D44\u683C\u6838\u5BF9\u3001\u5DEE\u4EF7\u8BA1\u7B97\u4E0E\u7533\u8BF7\u8349\u7A3F\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592909:00\u6838\u5BF9\u4EF7\u4FDD\u7533\u8BF7\u4E0E\u5F85\u786E\u8BA4\u8FDB\u5C55\uFF0C\u5230\u6709\u6548\u671F\u7ED3\u675F\u6216\u6838\u5B9E\u7ED3\u679C\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u4EF7\u4FDD\u7533\u8BF7\u4E0E\u8FDB\u5EA6\u8868\uFF1A\u8BB0\u5F55\u8BA2\u5355\u3001\u4EF7\u4FDD\u7A97\u53E3\u3001\u5DEE\u4EF7\u3001\u51ED\u8BC1\u548C\u5904\u7406\u7ED3\u679C\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u9891\u7387\u5728\u6709\u6548\u671F\u5185\u6838\u5BF9\u8FDB\u5C55\uFF0C\u5230\u671F\u6216\u8FBE\u6210\u6761\u4EF6\u540E\u505C\u6B62\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u6838\u5BF9\u8BA2\u5355\u548C\u89C4\u5219\uFF0C\u518D\u786E\u8BA4\u662F\u5426\u63D0\u4EA4\u7533\u8BF7\uFF1B\u63D0\u4EA4\u6210\u529F\u540E\u7EE7\u7EED\u533A\u5206\u53D7\u7406\u3001\u901A\u8FC7\u548C\u5B9E\u9645\u5230\u8D26\u3002",
    "mode": "mixed",
    "completionRule": "\u6309\u672C\u6B21\u76EE\u6807\u6838\u5B9E\u7533\u8BF7\u7ED3\u679C\u6216\u5230\u8D26\uFF1B\u53D7\u7406\u901A\u77E5\u4E0D\u76F4\u63A5\u4EE3\u8868\u9000\u6B3E\u5B8C\u6210\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592909:00\u6838\u5BF9\u4EF7\u4FDD\u7533\u8BF7\u4E0E\u5F85\u786E\u8BA4\u8FDB\u5C55\uFF0C\u5230\u6709\u6548\u671F\u7ED3\u675F\u6216\u6838\u5B9E\u7ED3\u679C\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 9 * * *"
  },
  {
    "id": "general-13",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F4B5}",
    "title": "\u628A\u5BB9\u6613\u9057\u6F0F\u7684\u62A5\u9500\u3001\u9000\u6B3E\u548C\u62BC\u91D1\u627E\u51FA\u6765\u3002",
    "description": "\u628A\u62A5\u9500\u53F0\u8D26\u3001\u9000\u8D27\u8BB0\u5F55\u3001\u62BC\u91D1\u51ED\u8BC1\u6216\u5F85\u9000\u6B3E\u8BA2\u5355\u4EA4\u7ED9\u6211\uFF0C\u6211\u4F1A\u6838\u5BF9\u54EA\u4E9B\u5C1A\u672A\u5230\u8D26\u3001\u9700\u8981\u8865\u4EC0\u4E48\u6750\u6599\uFF0C\u4EE5\u53CA\u5E94\u5411\u8C01\u8DDF\u8FDB\uFF0C\u6574\u7406\u4E00\u5F20\u56DE\u6B3E\u6E05\u5355\u3002",
    "needs": [
      "\u62A5\u9500\u3001\u9000\u6B3E\u3001\u62BC\u91D1\u6216\u5F85\u56DE\u6B3E\u8BB0\u5F55"
    ],
    "deliverable": "\u5F85\u5230\u8D26\u6E05\u5355\u3001\u8865\u6750\u6599\u63D0\u793A\u548C\u8DDF\u8FDB\u8BDD\u672F",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u5BB9\u6613\u9057\u6F0F\u7684\u62A5\u9500\u3001\u9000\u6B3E\u548C\u62BC\u91D1\u627E\u51FA\u6765\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u62A5\u9500\u3001\u9000\u6B3E\u3001\u62BC\u91D1\u6216\u5F85\u56DE\u6B3E\u8BB0\u5F55\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5F85\u5230\u8D26\u6E05\u5355\u3001\u8865\u6750\u6599\u63D0\u793A\u548C\u8DDF\u8FDB\u8BDD\u672F\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u5468\u4E0009:00\u68C0\u67E5\u672A\u5230\u8D26\u6B3E\u9879\uFF1B\u6709\u65B0\u6750\u6599\u65F6\u7ACB\u5373\u66F4\u65B0\uFF0C\u5168\u90E8\u6838\u5B9E\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u5F85\u56DE\u6B3E\u4E0E\u8865\u6750\u6599\u6E05\u5355\uFF1A\u9010\u7B14\u8BB0\u5F55\u62A5\u9500\u3001\u9000\u6B3E\u3001\u62BC\u91D1\u548C\u5BF9\u5E94\u7684\u5230\u8D26\u8BC1\u636E\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u5468\u671F\u8DDF\u8FDB\u672A\u5230\u8D26\u9879\u76EE\uFF0C\u4EC5\u5728\u6709\u53D8\u5316\u6216\u9700\u8981\u8865\u6750\u6599\u65F6\u63D0\u9192\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u9700\u8981\u8DDF\u8FDB\u7684\u6B3E\u9879\uFF0C\u518D\u6838\u5BF9\u4F60\u63D0\u4F9B\u6216\u6388\u6743\u8BBF\u95EE\u7684\u8BB0\u5F55\uFF1B\u672A\u6536\u5230\u65B0\u8BC1\u636E\u5C31\u4FDD\u7559\u5F85\u6838\u5B9E\u3002",
    "mode": "ongoing",
    "completionRule": "\u6BCF\u7B14\u56DE\u6B3E\u4F9D\u636E\u5230\u8D26\u8BB0\u5F55\u6216\u4F60\u7684\u660E\u786E\u786E\u8BA4\u5173\u95ED\uFF0C\u6574\u4F53\u53EF\u5728\u5168\u90E8\u6838\u5B9E\u540E\u7ED3\u675F\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u5468\u4E0009:00\u68C0\u67E5\u672A\u5230\u8D26\u6B3E\u9879\uFF1B\u6709\u65B0\u6750\u6599\u65F6\u7ACB\u5373\u66F4\u65B0\uFF0C\u5168\u90E8\u6838\u5B9E\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 9 * * 1"
  },
  {
    "id": "general-14",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F6CD}\uFE0F",
    "title": "\u60F3\u4E70\u4E8C\u624B\u597D\u7269\uFF1F\u6211\u5E2E\u4F60\u6BD4\u4EF7\u3001\u6574\u7406\u8BE2\u95EE\u8BDD\u672F\u3002",
    "description": "\u544A\u8BC9\u6211\u60F3\u4E70\u4EC0\u4E48\u3001\u9884\u7B97\u548C\u6240\u5728\u57CE\u5E02\uFF0C\u518D\u53D1\u6765\u95F2\u9C7C\u3001\u8F6C\u8F6C\u7B49\u5E73\u53F0\u7684\u5546\u54C1\u94FE\u63A5\u6216\u622A\u56FE\u3002\u6211\u4F1A\u5BF9\u7167\u6210\u8272\u3001\u914D\u4EF6\u3001\u540C\u7C7B\u4EF7\u683C\u548C\u4EA4\u6613\u6761\u4EF6\uFF0C\u5E2E\u4F60\u7B5B\u9009\u5E76\u51C6\u5907\u780D\u4EF7\u4E0E\u9A8C\u8D27\u95EE\u9898\u3002",
    "needs": [
      "\u5546\u54C1\u9700\u6C42\u3001\u9884\u7B97\u4E0E\u57CE\u5E02",
      "\u5019\u9009\u5546\u54C1\u94FE\u63A5\u6216\u622A\u56FE"
    ],
    "deliverable": "\u5019\u9009\u5BF9\u6BD4\u3001\u8BE2\u4EF7\u8BDD\u672F\u3001\u9A8C\u8D27\u4E0E\u81EA\u63D0\u6838\u5BF9\u6E05\u5355",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u60F3\u4E70\u4E8C\u624B\u597D\u7269\uFF1F\u6211\u5E2E\u4F60\u6BD4\u4EF7\u3001\u6574\u7406\u8BE2\u95EE\u8BDD\u672F\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u5546\u54C1\u9700\u6C42\u3001\u9884\u7B97\u4E0E\u57CE\u5E02\u3001\u5019\u9009\u5546\u54C1\u94FE\u63A5\u6216\u622A\u56FE\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5019\u9009\u5BF9\u6BD4\u3001\u8BE2\u4EF7\u8BDD\u672F\u3001\u9A8C\u8D27\u4E0E\u81EA\u63D0\u6838\u5BF9\u6E05\u5355\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592912:00\u68C0\u67E5\u53EF\u8BBF\u95EE\u5019\u9009\uFF0C\u5148\u4EE57\u5929\u4E3A\u8303\u56F4\uFF1B\u627E\u5230\u5408\u9002\u5546\u54C1\u3001\u8D44\u6599\u4E0D\u53EF\u8BBF\u95EE\u6216\u671F\u9650\u5230\u8FBE\u65F6\u660E\u786E\u56DE\u62A5\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u4E8C\u624B\u5019\u9009\u4E0E\u9A8C\u8D27\u5BF9\u7167\uFF1A\u6BD4\u8F83\u5546\u54C1\u6210\u8272\u3001\u914D\u4EF6\u3001\u4EF7\u683C\u548C\u4EA4\u6613\u6761\u4EF6\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u9891\u7387\u6838\u5BF9\u4F60\u63D0\u4F9B\u6216\u5141\u8BB8\u8BBF\u95EE\u7684\u5019\u9009\u5546\u54C1\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u9884\u7B97\u3001\u57CE\u5E02\u548C\u8981\u6C42\uFF0C\u518D\u6BD4\u8F83\u5019\u9009\uFF1B\u53D1\u9001\u8BE2\u95EE\u3001\u7EA6\u81EA\u63D0\u6216\u4ED8\u6B3E\u524D\u6309\u5177\u4F53\u64CD\u4F5C\u786E\u8BA4\u3002",
    "mode": "mixed",
    "completionRule": "\u5019\u9009\u7B5B\u9009\u5B8C\u6210\u53EF\u4EA4\u4ED8\uFF1B\u5B9E\u9645\u8D2D\u4E70\u4EE5\u7528\u6237\u786E\u8BA4\u53CA\u4EA4\u6613\u7ED3\u679C\u4E3A\u51C6\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592912:00\u68C0\u67E5\u53EF\u8BBF\u95EE\u5019\u9009\uFF0C\u5148\u4EE57\u5929\u4E3A\u8303\u56F4\uFF1B\u627E\u5230\u5408\u9002\u5546\u54C1\u3001\u8D44\u6599\u4E0D\u53EF\u8BBF\u95EE\u6216\u671F\u9650\u5230\u8FBE\u65F6\u660E\u786E\u56DE\u62A5\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 12 * * *"
  },
  {
    "id": "general-15",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1FA7A}",
    "title": "\u628A\u4E00\u518D\u62D6\u5EF6\u7684\u590D\u8BCA\uFF0C\u6574\u7406\u6210\u53EF\u4EE5\u9884\u7EA6\u7684\u4E0B\u4E00\u6B65\u3002",
    "description": "\u63D0\u4F9B\u533B\u751F\u5EFA\u8BAE\u7684\u590D\u8BCA\u9879\u76EE\u3001\u65F6\u95F4\u8303\u56F4\u548C\u5C31\u8BCA\u504F\u597D\uFF0C\u6211\u4F1A\u6574\u7406\u533B\u9662\u5B98\u65B9\u9884\u7EA6\u5165\u53E3\u3001\u9700\u8981\u51C6\u5907\u7684\u8D44\u6599\uFF0C\u4EE5\u53CA\u5C31\u8BCA\u524D\u8981\u95EE\u7684\u95EE\u9898\u3002\u5177\u4F53\u5C31\u8BCA\u65F6\u95F4\u7531\u4F60\u786E\u8BA4\uFF0C\u6D89\u53CA\u68C0\u67E5\u51C6\u5907\u65F6\u4EE5\u533B\u9662\u8981\u6C42\u4E3A\u51C6\u3002",
    "needs": [
      "\u533B\u751F\u7684\u590D\u8BCA\u5B89\u6392",
      "\u76EE\u6807\u533B\u9662\u3001\u53EF\u5C31\u8BCA\u65F6\u95F4\u4E0E\u5730\u533A"
    ],
    "deliverable": "\u9884\u7EA6\u4FE1\u606F\u6E05\u5355\u3001\u5C31\u8BCA\u51C6\u5907\u548C\u5F85\u786E\u8BA4\u65F6\u95F4",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u4E00\u518D\u62D6\u5EF6\u7684\u590D\u8BCA\uFF0C\u6574\u7406\u6210\u53EF\u4EE5\u9884\u7EA6\u7684\u4E0B\u4E00\u6B65\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u533B\u751F\u7684\u590D\u8BCA\u5B89\u6392\u3001\u76EE\u6807\u533B\u9662\u3001\u53EF\u5C31\u8BCA\u65F6\u95F4\u4E0E\u5730\u533A\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u9884\u7EA6\u4FE1\u606F\u6E05\u5355\u3001\u5C31\u8BCA\u51C6\u5907\u548C\u5F85\u786E\u8BA4\u65F6\u95F4\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u91C7\u7528\u533B\u751F\u5EFA\u8BAE\u4E0E\u5DF2\u786E\u8BA4\u9884\u7EA6\u65F6\u95F4\uFF0C\u9ED8\u8BA4\u5C31\u8BCA\u524D\u4E00\u592909:00\u63D0\u9192\u51C6\u5907\uFF1B\u7F3A\u5C11\u65E5\u671F\u65F6\u96C6\u4E2D\u95EE\u4E00\u6B21\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u590D\u8BCA\u9884\u7EA6\u4E0E\u51C6\u5907\u6E05\u5355\uFF1A\u8BB0\u5F55\u533B\u751F\u5EFA\u8BAE\u3001\u9884\u7EA6\u4FE1\u606F\u3001\u6240\u9700\u8D44\u6599\u4E0E\u5F85\u95EE\u95EE\u9898\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u77E5\u65E5\u671F\u6216\u9ED8\u8BA4\u65F6\u95F4\u63D0\u9192\u9884\u7EA6\u6216\u5C31\u8BCA\u51C6\u5907\uFF0C\u540E\u7EED\u7531\u4F60\u53CD\u9988\u5B9E\u9645\u60C5\u51B5\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u4F9D\u636E\u533B\u751F\u5B89\u6392\u6838\u5BF9\u65F6\u95F4\u548C\u533B\u9662\u4FE1\u606F\uFF0C\u518D\u51C6\u5907\u9884\u7EA6\uFF1B\u9884\u7EA6\u6210\u529F\u3001\u5B9E\u9645\u5C31\u8BCA\u548C\u540E\u7EED\u590D\u8BCA\u8BA1\u5212\u5206\u5F00\u8BB0\u5F55\u3002",
    "mode": "mixed",
    "completionRule": "\u9884\u7EA6\u7C7B\u76EE\u6807\u9700\u6838\u5B9E\u9884\u7EA6\u8BB0\u5F55\uFF1B\u5C31\u8BCA\u662F\u5426\u5B8C\u6210\u7531\u4F60\u53CD\u9988\uFF0C\u4E0D\u81EA\u884C\u63A8\u65AD\u3002",
    "defaultFollowUp": "\u91C7\u7528\u533B\u751F\u5EFA\u8BAE\u4E0E\u5DF2\u786E\u8BA4\u9884\u7EA6\u65F6\u95F4\uFF0C\u9ED8\u8BA4\u5C31\u8BCA\u524D\u4E00\u592909:00\u63D0\u9192\u51C6\u5907\uFF1B\u7F3A\u5C11\u65E5\u671F\u65F6\u96C6\u4E2D\u95EE\u4E00\u6B21\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-16",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F9F3}",
    "title": "\u628A\u65C5\u884C\u4FE1\u606F\u653E\u5728\u4E00\u8D77\uFF0C\u884C\u7A0B\u53D8\u5316\u66F4\u5BB9\u6613\u8DDF\u4E0A\u3002",
    "description": "\u544A\u8BC9\u6211\u76EE\u7684\u5730\u3001\u65E5\u671F\u548C\u9884\u7B97\uFF0C\u628A\u673A\u7968\u3001\u706B\u8F66\u7968\u3001\u9152\u5E97\u786E\u8BA4\u4FE1\u606F\u4EA4\u7ED9\u6211\u3002\u6211\u4F1A\u6574\u7406\u6BCF\u65E5\u884C\u7A0B\u3001\u4EA4\u901A\u8854\u63A5\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\uFF1B\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u9891\u7387\u76F4\u63A5\u8DDF\u8E2A\u9884\u8BA2\u4E0E\u884C\u7A0B\u53D8\u5316\u3002",
    "needs": [
      "\u76EE\u7684\u5730\u3001\u65E5\u671F\u4E0E\u9884\u7B97",
      "\u4EA4\u901A\u53CA\u9152\u5E97\u9884\u8BA2\u4FE1\u606F"
    ],
    "deliverable": "\u5B8C\u6574\u884C\u7A0B\u3001\u9884\u8BA2\u6C47\u603B\u548C\u53D8\u5316\u6838\u5BF9\u6E05\u5355",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u628A\u65C5\u884C\u4FE1\u606F\u653E\u5728\u4E00\u8D77\uFF0C\u884C\u7A0B\u53D8\u5316\u66F4\u5BB9\u6613\u8DDF\u4E0A\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u76EE\u7684\u5730\u3001\u65E5\u671F\u4E0E\u9884\u7B97\u3001\u4EA4\u901A\u53CA\u9152\u5E97\u9884\u8BA2\u4FE1\u606F\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u5B8C\u6574\u884C\u7A0B\u3001\u9884\u8BA2\u6C47\u603B\u548C\u53D8\u5316\u6838\u5BF9\u6E05\u5355\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592909:00\u300118:00\u6838\u5BF9\u53EF\u8BBF\u95EE\u7684\u884C\u7A0B\u53D8\u66F4\uFF0C\u65C5\u884C\u7ED3\u675F\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u5B9E\u65F6\u884C\u7A0B\u4E0E\u9884\u8BA2\u6E05\u5355\uFF1A\u6C47\u603B\u5DF2\u6838\u5B9E\u7684\u4EA4\u901A\u3001\u4F4F\u5BBF\u3001\u6BCF\u65E5\u5B89\u6392\u548C\u53D8\u66F4\u8BB0\u5F55\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u6709\u5B89\u6392\u6216\u9ED8\u8BA4\u9891\u7387\u6838\u5BF9\u53EF\u8BBF\u95EE\u7684\u9884\u8BA2\u53CA\u884C\u7A0B\u53D8\u5316\uFF0C\u91CD\u8981\u53D8\u5316\u65F6\u63D0\u9192\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u76EE\u7684\u5730\u3001\u65E5\u671F\u3001\u9884\u7B97\u548C\u53EF\u7528\u8D44\u6599\uFF0C\u518D\u751F\u6210\u53EF\u66F4\u65B0\u7684\u884C\u7A0B\uFF1B\u8D44\u6599\u9F50\u5168\u540E\u76F4\u63A5\u8BBE\u7F6E\u771F\u5B9E\u6392\u7A0B\uFF0C\u884C\u7A0B\u6539\u53D8\u6216\u9700\u8981\u51B3\u5B9A\u65F6\u518D\u901A\u77E5\u3002",
    "mode": "ongoing",
    "completionRule": "\u884C\u7A0B\u8349\u7A3F\u4EA4\u4ED8\u53EA\u5B8C\u6210\u51C6\u5907\u9636\u6BB5\uFF1B\u65C5\u884C\u7ED3\u675F\u6216\u4F60\u660E\u786E\u7ED3\u675F\u8DDF\u8E2A\u540E\u6536\u5C3E\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592909:00\u300118:00\u6838\u5BF9\u53EF\u8BBF\u95EE\u7684\u884C\u7A0B\u53D8\u66F4\uFF0C\u65C5\u884C\u7ED3\u675F\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 9,18 * * *"
  },
  {
    "id": "general-17",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u2708\uFE0F",
    "title": "\u673A\u7968\u964D\u5230\u9884\u7B97\u5185\u65F6\uFF0C\u63D0\u9192\u6211\u770B\u770B\u3002",
    "description": "\u63D0\u4F9B\u822A\u7EBF\u3001\u65E5\u671F\u8303\u56F4\u3001\u4EBA\u6570\u548C\u9884\u7B97\u4E0A\u9650\uFF0C\u6211\u4F1A\u5148\u6574\u7406\u7968\u4EF7\u6BD4\u8F83\u6761\u4EF6\uFF0C\u5305\u62EC\u884C\u674E\u3001\u9000\u6539\u548C\u4E2D\u8F6C\u9650\u5236\u3002\u8D44\u6599\u9F50\u5168\u540E\u76F4\u63A5\u5B89\u6392\u68C0\u67E5\u4E0E\u63D0\u9192\uFF1B\u8BA2\u7968\u548C\u4ED8\u6B3E\u524D\u7531\u4F60\u786E\u8BA4\u3002",
    "needs": [
      "\u822A\u7EBF\u3001\u65E5\u671F\u8303\u56F4\u3001\u4EBA\u6570\u4E0E\u9884\u7B97",
      "\u884C\u674E\u3001\u9000\u6539\u53CA\u4E2D\u8F6C\u8981\u6C42"
    ],
    "deliverable": "\u7968\u4EF7\u6BD4\u8F83\u65B9\u6848\u4E0E\u5B9E\u9645\u63D0\u9192\u5B89\u6392",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u673A\u7968\u964D\u5230\u9884\u7B97\u5185\u65F6\uFF0C\u63D0\u9192\u6211\u770B\u770B\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u822A\u7EBF\u3001\u65E5\u671F\u8303\u56F4\u3001\u4EBA\u6570\u4E0E\u9884\u7B97\u3001\u884C\u674E\u3001\u9000\u6539\u53CA\u4E2D\u8F6C\u8981\u6C42\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u7968\u4EF7\u6BD4\u8F83\u65B9\u6848\u4E0E\u5B9E\u9645\u63D0\u9192\u5B89\u6392\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u9ED8\u8BA4\u6BCF\u592909:00\u300118:00\u68C0\u67E5\u53EF\u83B7\u5F97\u7684\u7968\u4EF7\uFF0C\u81F3\u51FA\u53D1\u65E5\u6216\u627E\u5230\u5E76\u5904\u7406\u7B26\u5408\u6761\u4EF6\u7684\u7968\u4EF7\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u673A\u7968\u6BD4\u8F83\u4E0E\u63D0\u9192\u6761\u4EF6\uFF1A\u7EDF\u4E00\u822A\u7EBF\u3001\u65E5\u671F\u3001\u884C\u674E\u3001\u9000\u6539\u548C\u9884\u7B97\u6BD4\u8F83\u53E3\u5F84\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u8865\u9F50\u9884\u7B97\u9608\u503C\u548C\u622A\u6B62\u65E5\u671F\u540E\uFF0C\u6309\u9ED8\u8BA4\u9891\u7387\u6838\u5BF9\u53EF\u83B7\u53D6\u7684\u7968\u4EF7\u5E76\u63D0\u9192\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u8865\u9F50\u6BD4\u8F83\u6761\u4EF6\uFF0C\u518D\u76F4\u63A5\u5F00\u542F\u5B9E\u9645\u6301\u7EED\u68C0\u67E5\uFF1B\u53D1\u73B0\u7B26\u5408\u6761\u4EF6\u7684\u7968\u4EF7\u4EC5\u63D0\u793A\uFF0C\u9884\u8BA2\u4ED8\u6B3E\u7531\u4F60\u786E\u8BA4\u3002",
    "mode": "ongoing",
    "completionRule": "\u53D1\u73B0\u4F4E\u4EF7\u4EC5\u5B8C\u6210\u4E00\u6B21\u68C0\u67E5\uFF1B\u8FBE\u5230\u7EA6\u5B9A\u6761\u4EF6\u5E76\u5904\u7406\uFF0C\u6216\u5230\u622A\u6B62\u65E5\u671F\u540E\u7ED3\u675F\u3002",
    "defaultFollowUp": "\u9ED8\u8BA4\u6BCF\u592909:00\u300118:00\u68C0\u67E5\u53EF\u83B7\u5F97\u7684\u7968\u4EF7\uFF0C\u81F3\u51FA\u53D1\u65E5\u6216\u627E\u5230\u5E76\u5904\u7406\u7B26\u5408\u6761\u4EF6\u7684\u7968\u4EF7\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002",
    "defaultCron": "0 9,18 * * *"
  },
  {
    "id": "general-18",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F4E6}",
    "title": "\u51C6\u5907\u642C\u5BB6\uFF1F\u5148\u628A\u62A5\u4EF7\u3001\u65F6\u95F4\u548C\u5730\u5740\u53D8\u66F4\u7406\u6E05\u695A\u3002",
    "description": "\u544A\u8BC9\u6211\u642C\u5BB6\u65F6\u95F4\u3001\u4E24\u5730\u4F4D\u7F6E\u548C\u7269\u54C1\u60C5\u51B5\uFF0C\u6211\u4F1A\u6574\u7406\u6253\u5305\u6E05\u5355\u3001\u642C\u5BB6\u516C\u53F8\u8BE2\u4EF7\u8868\u4E0E\u642C\u5BB6\u65E5\u5B89\u6392\uFF0C\u5E76\u5217\u51FA\u5FEB\u9012\u6536\u8D27\u3001\u5E38\u7528\u8D2D\u7269\u5E73\u53F0\u548C\u8D26\u5355\u5730\u5740\u7B49\u9700\u8981\u66F4\u65B0\u7684\u5730\u65B9\u3002",
    "needs": [
      "\u642C\u5BB6\u65F6\u95F4\u3001\u5730\u70B9\u4E0E\u7269\u54C1\u60C5\u51B5",
      "\u697C\u5C42\u3001\u7535\u68AF\u53CA\u7279\u6B8A\u642C\u8FD0\u9700\u6C42"
    ],
    "deliverable": "\u642C\u5BB6\u6E05\u5355\u3001\u8D39\u7528\u6838\u5BF9\u8868\u3001\u65F6\u95F4\u5B89\u6392\u4E0E\u5730\u5740\u66F4\u65B0\u6E05\u5355",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u51C6\u5907\u642C\u5BB6\uFF1F\u5148\u628A\u62A5\u4EF7\u3001\u65F6\u95F4\u548C\u5730\u5740\u53D8\u66F4\u7406\u6E05\u695A\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u642C\u5BB6\u65F6\u95F4\u3001\u5730\u70B9\u4E0E\u7269\u54C1\u60C5\u51B5\u3001\u697C\u5C42\u3001\u7535\u68AF\u53CA\u7279\u6B8A\u642C\u8FD0\u9700\u6C42\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u642C\u5BB6\u6E05\u5355\u3001\u8D39\u7528\u6838\u5BF9\u8868\u3001\u65F6\u95F4\u5B89\u6392\u4E0E\u5730\u5740\u66F4\u65B0\u6E05\u5355\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u6309\u5DF2\u77E5\u642C\u5BB6\u65E5\uFF0C\u57283\u5929\u524D\u548C1\u5929\u524D09:00\u68C0\u67E5\u51C6\u5907\u4E8B\u9879\uFF1B\u5B8C\u6210\u7EA6\u5B9A\u8282\u70B9\u540E\u505C\u6B62\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u642C\u5BB6\u6E05\u5355\u4E0E\u8D39\u7528\u65F6\u95F4\u8868\uFF1A\u6574\u7406\u7269\u54C1\u3001\u62A5\u4EF7\u3001\u6253\u5305\u8282\u70B9\u548C\u9700\u8981\u66F4\u65B0\u7684\u5730\u5740\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u5B9A\u671F\u4EFB\u52A1",
        "description": "\u6309\u5DF2\u77E5\u7684\u8282\u70B9\u63D0\u9192\u6253\u5305\u3001\u6838\u5BF9\u62A5\u4EF7\u548C\u66F4\u65B0\u5730\u5740\u3002",
        "kind": "schedule"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u642C\u5BB6\u8303\u56F4\uFF0C\u518D\u62C6\u5206\u8282\u70B9\uFF1B\u9884\u7EA6\u3001\u5B9E\u9645\u642C\u8FD0\u548C\u5730\u5740\u66F4\u65B0\u5206\u522B\u8BB0\u5F55\u53EF\u6838\u5B9E\u7684\u7ED3\u679C\u3002",
    "mode": "mixed",
    "completionRule": "\u672C\u6B21\u7EA6\u5B9A\u7684\u642C\u5BB6\u8282\u70B9\u548C\u5730\u5740\u4E8B\u9879\u5B8C\u6210\u5E76\u786E\u8BA4\uFF0C\u672A\u5B8C\u6210\u9879\u76EE\u7EE7\u7EED\u4FDD\u7559\u3002",
    "defaultFollowUp": "\u6309\u5DF2\u77E5\u642C\u5BB6\u65E5\uFF0C\u57283\u5929\u524D\u548C1\u5929\u524D09:00\u68C0\u67E5\u51C6\u5907\u4E8B\u9879\uFF1B\u5B8C\u6210\u7EA6\u5B9A\u8282\u70B9\u540E\u505C\u6B62\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  },
  {
    "id": "general-19",
    "category": "\u66F4\u591A\u70B9\u5B50",
    "icon": "\u{1F3E0}",
    "title": "\u51C6\u5907\u88C5\u4FEE\uFF1F\u5148\u628A\u9700\u6C42\u548C\u62A5\u4EF7\u653E\u5230\u540C\u4E00\u5F20\u8868\u91CC\u3002",
    "description": "\u63CF\u8FF0\u623F\u5C4B\u60C5\u51B5\u3001\u65BD\u5DE5\u8303\u56F4\u3001\u9884\u7B97\u548C\u5DE5\u671F\uFF0C\u6211\u4F1A\u6574\u7406\u8BE2\u4EF7\u9700\u6C42\uFF0C\u5BF9\u7167\u6750\u6599\u3001\u5DE5\u7A0B\u91CF\u3001\u8BA1\u4EF7\u65B9\u5F0F\u3001\u589E\u9879\u548C\u4ED8\u6B3E\u8282\u70B9\uFF0C\u5E2E\u52A9\u4F60\u6BD4\u8F83\u88C5\u4FEE\u516C\u53F8\u6216\u65BD\u5DE5\u56E2\u961F\u7684\u65B9\u6848\u3002",
    "needs": [
      "\u623F\u5C4B\u60C5\u51B5\u3001\u65BD\u5DE5\u8303\u56F4\u3001\u9884\u7B97\u4E0E\u5DE5\u671F",
      "\u5DF2\u6709\u65B9\u6848\u6216\u62A5\u4EF7"
    ],
    "deliverable": "\u7EDF\u4E00\u8BE2\u4EF7\u9700\u6C42\u3001\u62A5\u4EF7\u5BF9\u7167\u8868\u4E0E\u5F85\u786E\u8BA4\u95EE\u9898",
    "instruction": "\u7528\u6237\u9009\u62E9\u4E86\u4E00\u6761\u901A\u7528\u5EFA\u8BAE\uFF1A\u51C6\u5907\u88C5\u4FEE\uFF1F\u5148\u628A\u9700\u6C42\u548C\u62A5\u4EF7\u653E\u5230\u540C\u4E00\u5F20\u8868\u91CC\u3002\u3002\u8FD9\u4E0D\u662F\u6839\u636E\u4E2A\u4EBA\u8BB0\u5FC6\u6216\u65E2\u6709\u504F\u597D\u63A8\u65AD\u7684\u4E8B\u5B9E\u3002\u590D\u7528\u73B0\u6709\u8D44\u6599\uFF0C\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5C11\u7684\u5173\u952E\u8D44\u6599\uFF1A\u623F\u5C4B\u60C5\u51B5\u3001\u65BD\u5DE5\u8303\u56F4\u3001\u9884\u7B97\u4E0E\u5DE5\u671F\u3001\u5DF2\u6709\u65B9\u6848\u6216\u62A5\u4EF7\u3002\u76EE\u6807\u4EA4\u4ED8\uFF1A\u7EDF\u4E00\u8BE2\u4EF7\u9700\u6C42\u3001\u62A5\u4EF7\u5BF9\u7167\u8868\u4E0E\u5F85\u786E\u8BA4\u95EE\u9898\u3002\u4EC5\u4F7F\u7528\u7528\u6237\u63D0\u4F9B\u6216\u660E\u786E\u6388\u6743\u8BBF\u95EE\u7684\u8D44\u6599\uFF0C\u4E0D\u58F0\u79F0\u5DF2\u8FDE\u63A5\u672A\u63A5\u5165\u7684\u670D\u52A1\u3002\u9700\u8981\u6301\u7EED\u8FD0\u884C\u6216\u63D0\u9192\u65F6\uFF0C\u987B\u5B9E\u9645\u521B\u5EFA\u5E76\u6838\u5B9E\u5BF9\u5E94\u4EFB\u52A1\uFF1B\u4E0D\u5F97\u53EA\u7528\u53E3\u5934\u627F\u8BFA\u4EE3\u66FF\u3002\u8054\u7CFB\u7B2C\u4E09\u65B9\u3001\u63D0\u4EA4\u7533\u8BF7\u3001\u53D6\u6D88\u670D\u52A1\u3001\u9884\u7EA6\u3001\u9884\u8BA2\u6216\u4ED8\u6B3E\u524D\uFF0C\u5148\u786E\u8BA4\u5177\u4F53\u5BF9\u8C61\u548C\u64CD\u4F5C\u3002 \u7528\u6237\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\uFF0C\u76F4\u63A5\u5B8C\u6210\u4E0A\u8FF0\u5FC5\u8981\u6B65\u9AA4\uFF1B\u6309\u5DF2\u6709\u504F\u597D\u6216\u672C\u9879\u9ED8\u8BA4\u8DDF\u8FDB\u89C4\u5219\u521B\u5EFA\u5E76\u6838\u5B9E\u5B9E\u9645\u4EFB\u52A1\uFF0C\u4E0D\u518D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u3002\u9ED8\u8BA4\u5B89\u6392\uFF1A\u5148\u5B8C\u6210\u672C\u6B21\u7EA6\u5B9A\u7684\u9700\u6C42\u548C\u62A5\u4EF7\u6BD4\u8F83\uFF0C\u6709\u660E\u786E\u62A5\u4EF7\u622A\u6B62\u65F6\u95F4\u65F6\u5B89\u6392\u4E00\u6B21\u5230\u671F\u8DDF\u8FDB\u3002",
    "includes": [
      {
        "title": "\u6784\u4EF6",
        "description": "\u88C5\u4FEE\u9700\u6C42\u4E0E\u62A5\u4EF7\u770B\u677F\uFF1A\u6309\u6750\u6599\u3001\u5DE5\u7A0B\u91CF\u3001\u589E\u9879\u3001\u5DE5\u671F\u548C\u4ED8\u6B3E\u8282\u70B9\u7EDF\u4E00\u6BD4\u8F83\u3002",
        "kind": "artifact"
      },
      {
        "title": "\u4E8B\u9879\u8DDF\u8FDB",
        "description": "\u8DDF\u8FDB\u7EA6\u5B9A\u7684\u62A5\u4EF7\u4E0E\u5F85\u786E\u8BA4\u95EE\u9898\uFF0C\u6536\u5230\u65B0\u8D44\u6599\u65F6\u66F4\u65B0\u5BF9\u7167\u3002",
        "kind": "action"
      }
    ],
    "howItWorks": "\u5148\u786E\u8BA4\u65BD\u5DE5\u8303\u56F4\u548C\u9884\u7B97\uFF0C\u518D\u6574\u7406\u9700\u6C42\u4E0E\u5019\u9009\u62A5\u4EF7\uFF1B\u9009\u62E9\u4F9B\u5E94\u5546\u3001\u7B7E\u7EA6\u6216\u4ED8\u6B3E\u524D\u7531\u4F60\u51B3\u5B9A\u3002",
    "mode": "mixed",
    "completionRule": "\u62A5\u4EF7\u6BD4\u8F83\u4EA4\u4ED8\u4E0D\u7B49\u4E8E\u65BD\u5DE5\u5B8C\u5DE5\uFF1B\u6309\u672C\u6B21\u660E\u786E\u7684\u4EFB\u52A1\u8303\u56F4\u5206\u522B\u9A8C\u6536\u3002",
    "defaultFollowUp": "\u5148\u5B8C\u6210\u672C\u6B21\u7EA6\u5B9A\u7684\u9700\u6C42\u548C\u62A5\u4EF7\u6BD4\u8F83\uFF0C\u6709\u660E\u786E\u62A5\u4EF7\u622A\u6B62\u65F6\u95F4\u65F6\u5B89\u6392\u4E00\u6B21\u5230\u671F\u8DDF\u8FDB\u3002",
    "executionPolicy": "\u660E\u786E\u70B9\u51FB\u9A6C\u4E0A\u5F00\u59CB\u540E\u76F4\u63A5\u63A8\u8FDB\u5FC5\u8981\u6B65\u9AA4\u548C\u8DDF\u8E2A\uFF0C\u4E0D\u53CD\u590D\u8BE2\u95EE\u662F\u5426\u9700\u8981\u521B\u5EFA\u4EFB\u52A1\uFF1B\u53EA\u96C6\u4E2D\u8BE2\u95EE\u7F3A\u5931\u7684\u5173\u952E\u8D44\u6599\u6216\u5177\u4F53\u9AD8\u5F71\u54CD\u64CD\u4F5C\u3002"
  }
];

// src/client/progress.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function GoalSyncStatus({ idea, api, t }) {
  if (!idea.goalSync) return null;
  const sync = idea.goalSync;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pai-ideas-goal-sync", role: sync.state === "error" ? "alert" : "status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(sync.state === "synced" ? "goalSynced" : sync.state === "error" ? "goalSyncError" : "goalSyncPending") }),
    sync.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: sync.error }),
    sync.state !== "synced" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        disabled: api.getSnapshot().busy,
        onClick: () => void api.run("update", { id: idea.id, revision: idea.revision, action: "syncGoal" }),
        children: t("retryGoalSync")
      }
    )
  ] });
}
function ProgressPanel({ idea, api, t }) {
  const [note, setNote] = (0, import_react.useState)(idea.progress?.pendingFollowup?.note ?? "");
  const p = idea.progress, busy = api.getSnapshot().busy;
  const update = (action) => api.run("update", {
    id: idea.id,
    revision: idea.revision,
    action,
    ...action === "complete" ? { note: note.trim() } : {}
  });
  if (!idea.execution) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "pai-ideas-progress", "aria-label": t("progressTitle"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("progressTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "pai-ideas-progress-state", children: progressLabel(idea, t) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p?.summary || t("legacyProgress") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalSyncStatus, { idea, api, t }),
    p?.nextStep && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
        t("nextStep"),
        "\uFF1A"
      ] }),
      p.nextStep
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pai-ideas-progress-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("completionRule") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p?.completionRule || idea.instruction }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t("completionHint") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pai-ideas-progress-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("followupTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p ? t(`followup_${p.followUp.state}`) : t("legacyProgress") }),
      p?.followUp.nextAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        t("nextCheck"),
        "\uFF1A",
        date(p.followUp.nextAt)
      ] }),
      p?.followUp.ids.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
        t("scheduleId"),
        "\uFF1A",
        id
      ] }, id)),
      p?.followUp.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "pai-ideas-error", children: p.followUp.error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t("hostRequired") })
    ] }),
    !!p?.artifacts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pai-ideas-progress-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("artifacts") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: p.artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: a.path }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
          date(a.at),
          " \xB7 ",
          t("presentedSource"),
          " #",
          a.seq
        ] })
      ] }, `${a.seq}:${a.path}`)) })
    ] }),
    p?.lastVerifiedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
      t("lastVerified"),
      "\uFF1A",
      date(p.lastVerifiedAt)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pai-ideas-card-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => api.openConversation(idea.execution.sessionId), children: t("viewConversation") }),
      idea.status === "started" && p?.lifecycle !== "stopped" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => void update(p?.lifecycle === "paused" ? "resume" : "pause"), children: t(p?.lifecycle === "paused" ? "resumeTracking" : "pauseTracking") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => void update("stop"), children: t("stopTracking") })
      ] })
    ] }),
    idea.status === "started" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { className: "pai-ideas-finish", onSubmit: (event) => {
      event.preventDefault();
      void api.run("followup", { id: idea.id, revision: idea.revision, note }).then((ok) => {
        if (ok) setNote("");
      });
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        t("progressNote"),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { value: note, maxLength: 4e3, onChange: (event) => setNote(event.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "submit", disabled: busy || !note.trim() || p?.lifecycle !== "active", children: t("sendProgress") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy || !note.trim(), onClick: () => void update("complete"), children: t("completeWithNote") })
    ] }),
    !!p?.activity.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "pai-ideas-details", open: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t("recentActivity") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { children: p.activity.slice(-12).reverse().map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        a.summary,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
          date(a.at),
          " \xB7 ",
          a.source,
          a.seq === void 0 ? "" : ` #${a.seq}`
        ] })
      ] }, `${a.at}:${i}`)) })
    ] })
  ] });
}
function progressLabel(idea, t) {
  if (idea.status === "completed") return t("completed");
  const p = idea.progress;
  if (!p) return t(idea.status);
  if (p.lifecycle === "paused") return t("pausedGoal");
  if (p.lifecycle === "stopped") return t("stoppedGoal");
  return t(`run_${p.run}`);
}
function date(value) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

// src/client/general.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function GeneralCatalog({ t, onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "pai-ideas-general", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "pai-ideas-general-heading", children: t("generalTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "pai-ideas-general-hint", children: t("generalHint") }),
    GENERAL_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { "aria-label": category, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: category }),
      GENERAL_IDEAS.filter((item) => item.category === category).map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "pai-ideas-general-row", onClick: () => onSelect(item.id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "pai-ideas-general-icon", "aria-hidden": true, children: item.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "pai-ideas-general-copy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: item.title }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: item.description })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": true, children: "\u203A" })
      ] }, item.id))
    ] }, category))
  ] });
}
function GeneralDetail({ item, api, t, sessionId, onClose }) {
  const state = api.getSnapshot();
  const record = state.ideas.find((idea) => idea.templateId === item.id && !["completed", "dismissed"].includes(idea.status) && idea.progress?.lifecycle !== "stopped");
  const accepted = record?.execution?.state === "accepted";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("article", { className: "pai-ideas-sheet", "aria-label": item.title, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "pai-ideas-sheet-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h2", { children: [
        item.icon,
        " ",
        item.title
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", autoFocus: true, "aria-label": t("closeDetail"), onClick: onClose, children: "\xD7" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "pai-ideas-sheet-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "pai-ideas-badge", children: t("generalOrigin") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "pai-ideas-sheet-intro", children: item.description }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: t("includesTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { className: "pai-ideas-includes", children: item.includes.map((part, n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "pai-ideas-include-icon", "aria-hidden": true, children: "\u25A4" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: part.title }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: part.description })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "pai-ideas-included", "aria-label": t("included"), children: "\u2713" })
      ] }, n)) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: t("howTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "pai-ideas-sheet-how", children: [
        item.howItWorks,
        " ",
        t("startPolicy")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: t("includedHint") }),
      record && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ProgressPanel, { idea: record, api, t }),
      record?.execution?.state === "pending" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "pai-ideas-pending", children: t("pending") }),
      state.error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "pai-ideas-error", role: "alert", children: state.error })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("footer", { className: "pai-ideas-sheet-footer", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("details", { className: "pai-ideas-sheet-menu", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("summary", { "aria-label": t("moreActions"), children: "\xB7\xB7\xB7" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: t("generalNeeds") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { children: item.needs.map((need) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: need }, need)) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: t("defaultFollowup") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: item.defaultFollowUp }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: t("completionRule") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: item.completionRule }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", onClick: onClose, children: t("closeDetail") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "pai-ideas-primary", disabled: state.busy, onClick: () => {
        if (accepted) api.openConversation(record.execution.sessionId);
        else void api.run("startGeneral", { templateId: item.id, sessionId });
      }, children: accepted ? t("viewConversation") : record?.execution ? t("retry") : t("startNow") })
    ] })
  ] });
}

// src/recommendations.ts
function balancedIdeas(items, count, first = items[0]?.basis ?? "memory") {
  const groups = { memory: items.filter((item) => item.basis !== "goal"), goal: items.filter((item) => item.basis === "goal") };
  const result = [];
  let next = first;
  while (result.length < count && (groups.memory.length || groups.goal.length)) {
    const item = groups[next].shift() ?? groups[next === "memory" ? "goal" : "memory"].shift();
    if (item) result.push(item);
    next = next === "memory" ? "goal" : "memory";
  }
  return result;
}
function newestIdeas(a, b) {
  return b.createdAt.localeCompare(a.createdAt) || (a.batchOrder ?? 0) - (b.batchOrder ?? 0);
}

// src/client/panel.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function IdeasPanel({ api, t, sessionId, sessionLabel, compact, onOpen, onBack }) {
  const state = (0, import_react2.useSyncExternalStore)(api.subscribe, api.getSnapshot);
  const [query, setQuery] = (0, import_react2.useState)("");
  const [filter, setFilter] = (0, import_react2.useState)("active");
  const [selectedId, setSelectedId] = (0, import_react2.useState)();
  const [generalId, setGeneralId] = (0, import_react2.useState)();
  (0, import_react2.useEffect)(() => {
    void api.refresh();
  }, [api]);
  const items = state.ideas.filter((idea) => filter === "all" || (filter === "inProgress" ? idea.status === "started" && idea.progress?.lifecycle !== "stopped" : filter === "active" ? idea.source !== "general" && ["suggested", "adopted"].includes(idea.status) && !idea.archivedAt : idea.status === filter)).sort(newestIdeas);
  const shown = filter === "active" ? balancedIdeas(items, 3) : items;
  const selected = state.ideas.find((idea) => idea.id === selectedId);
  const general = GENERAL_IDEAS.find((item) => item.id === generalId);
  if (general) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("section", { className: `pai-ideas pai-ideas-detail-root${compact ? " pai-ideas-compact" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GeneralDetail, { item: general, api, t, sessionId, onClose: () => setGeneralId(void 0) }) });
  if (selected) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("section", { className: `pai-ideas pai-ideas-detail-root${compact ? " pai-ideas-compact" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    IdeaCard,
    {
      idea: selected,
      api,
      t,
      sessionId,
      disabled: state.busy,
      index: 0,
      detail: true,
      error: state.error,
      onSelect: () => {
      },
      onClose: () => setSelectedId(void 0)
    }
  ) });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: `pai-ideas${compact ? " pai-ideas-compact" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("header", { className: "pai-ideas-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "pai-ideas-eyebrow", children: "PERSONAL AI" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h1", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bulb, { size: 27 }),
          t("title")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: t(compact ? "compactSubtitle" : "subtitle") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-heading-actions", children: [
        onOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: onOpen, children: [
          t("open"),
          " \u2197"
        ] }),
        onBack && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: onBack, children: [
          t("back"),
          " \u2192"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-engine", role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: state.generating ? "working" : "" }),
        t(state.generating ? "backgroundWorking" : state.engine.enabled ? "backgroundReady" : "backgroundOff")
      ] }),
      state.engine.lastUpdatedAt && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("time", { children: [
        t("lastUpdated"),
        " \xB7 ",
        formatDate(state.engine.lastUpdatedAt)
      ] }),
      state.engine.enabled && state.engine.nextAttemptAt && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("time", { children: [
        t("nextUpdate"),
        " \xB7 ",
        formatDate(state.engine.nextAttemptAt)
      ] })
    ] }),
    state.engine.lastError && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-background-error", children: t("backgroundFailed") }),
    state.sourceNotice && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-notice", role: "status", children: state.sourceNotice }),
    state.error && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-error", role: "alert", children: [
      t("error"),
      "\uFF1A",
      state.error
    ] }),
    state.notice && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pai-ideas-notice", role: "status", children: t(state.notice) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pai-ideas-filters", children: ["active", "inProgress", "completed", "dismissed", "all"].map((key) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          "aria-pressed": filter === key,
          onClick: () => setFilter(key),
          children: t(key)
        },
        key
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
        void api.refresh();
      }, children: t("refresh") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pai-ideas-grid", "aria-busy": state.busy, children: shown.map((idea, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IdeaCard, { ...{ idea, api, t, sessionId, disabled: state.busy, index }, onSelect: () => setSelectedId(idea.id) }, idea.id)) }),
    state.loading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pai-ideas-empty", role: "status", children: t("loading") }) : !shown.length && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bulb, { size: 36 }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: t(state.ideas.length ? "noMatch" : "empty") }),
      !state.ideas.length && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: t(state.engine.enabled ? "emptyHint" : "manualHint") })
    ] }),
    filter === "active" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GeneralCatalog, { t, onSelect: setGeneralId }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "pai-ideas-compose", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: t("customGenerate") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { htmlFor: compact ? "pai-topic-side" : "pai-topic-main", children: t("topic") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: compact ? "pai-topic-side" : "pai-topic-main",
            placeholder: t("placeholder"),
            value: query,
            maxLength: 2e3,
            onChange: (event) => setQuery(event.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "pai-ideas-primary", disabled: state.generating, onClick: () => {
          void api.run("generate", { query }).then((ok) => {
            if (ok) {
              setFilter("active");
            }
          });
        }, children: state.generating ? t("generating") : t("generate") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { children: t("instructions") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("footer", { className: "pai-ideas-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
        state.ideas.length,
        " ",
        t("count")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: sessionId ? `${t("target")} \xB7 ${sessionLabel || sessionId}` : t("noSession") })
    ] })
  ] });
}
function IdeaCard({ idea, api, t, sessionId, disabled, index, detail, error, onSelect, onClose }) {
  const [editing, setEditing] = (0, import_react2.useState)(null);
  const [note, setNote] = (0, import_react2.useState)("");
  const pending = idea.execution?.state === "pending";
  const active = ["suggested", "adopted"].includes(idea.status);
  const start = () => {
    if (!disabled && !editing && active) void api.run("start", { id: idea.id, revision: idea.revision, sessionId });
  };
  const update = (action) => api.run("update", { id: idea.id, revision: idea.revision, action, note });
  const edit = (action) => {
    setEditing(action);
    setNote("");
  };
  const eventLabels = {
    generated: "eventGenerated",
    adopt: "eventAdopt",
    dismiss: "eventDismiss",
    restore: "eventRestore",
    dispatching: "eventDispatching",
    started: "eventStarted",
    complete: "eventComplete",
    adjust: "eventAdjust",
    archived: "eventArchived"
  };
  const editor = editing ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("form", { className: "pai-ideas-finish", onSubmit: (event) => {
    event.preventDefault();
    void update(editing).then((ok) => {
      if (ok) edit(null);
    });
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { children: [
      t(editing === "complete" ? "note" : editing === "adjust" ? "adjustNote" : "dismissReason"),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("textarea", { required: editing !== "dismiss", maxLength: editing === "complete" ? 8e3 : 2e3, value: note, onChange: (event) => setNote(event.target.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "submit", className: "pai-ideas-primary", disabled: disabled || editing !== "dismiss" && !note.trim(), children: t(editing === "complete" ? "saveCompletion" : editing === "adjust" ? "saveAdjustment" : "confirmDismiss") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => edit(null), children: t("cancel") })
  ] }) : null;
  if (detail) {
    const template = idea.source === "general" ? GENERAL_IDEAS.find((item) => item.id === idea.templateId) : void 0;
    const contents = template?.includes ?? (idea.includes?.length ? idea.includes : [{ title: idea.title, description: idea.description }]);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("article", { className: "pai-ideas-sheet", "aria-label": idea.title, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("header", { className: "pai-ideas-sheet-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: idea.title }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", autoFocus: true, "aria-label": t("closeDetail"), onClick: onClose, children: "\xD7" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-sheet-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-sheet-intro", children: idea.description }),
        idea.source !== "general" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "pai-ideas-goal", children: [
          t(idea.basis === "goal" ? "goalOrigin" : "memoryOrigin"),
          idea.goalRef && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            " \xB7 ",
            idea.goal,
            " \xB7 ",
            idea.goalRef.title
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: t("includesTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "pai-ideas-includes", children: contents.map((item, n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "pai-ideas-include-icon", "aria-hidden": true, children: n === 0 ? "\u25F7" : "\u25A4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: item.title }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: item.description })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "pai-ideas-included", "aria-label": t("included"), children: "\u2713" })
        ] }, n)) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: t("howTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-sheet-how", children: template ? `${template.howItWorks} ${t("startPolicy")}` : idea.howItWorks || t("workflowFallback") }),
        idea.feedback?.some((item) => item.kind === "adjust") && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "pai-ideas-adjusted", children: [
          t("yourAdjustment"),
          "\uFF1A",
          idea.feedback.filter((item) => item.kind === "adjust").at(-1)?.note
        ] }),
        pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-pending", children: t("pending") }),
        error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pai-ideas-error", role: "alert", children: error }),
        idea.completion && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-completion", children: idea.completion.note }),
        idea.execution && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProgressPanel, { idea, api, t }),
        editor
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("footer", { className: "pai-ideas-sheet-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "pai-ideas-sheet-menu", onClick: (event) => {
          if (event.target.closest("button")) event.currentTarget.open = false;
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { "aria-label": t("moreActions"), children: "\xB7\xB7\xB7" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            idea.status === "suggested" && !pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => {
              void update("adopt");
            }, children: t("adopt") }),
            active && !pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => edit("adjust"), children: t("adjust") }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => edit("dismiss"), children: t("dismiss") })
            ] }),
            idea.status === "started" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => edit("complete"), children: t("complete") }),
            idea.status === "dismissed" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => {
              void update("restore");
            }, children: t("restore") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: t(idea.source === "general" ? "generalEvidence" : "evidence") }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-pre", children: idea.instruction }),
              idea.evidence.map((text, n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("blockquote", { children: text }, n))
            ] })
          ] })
        ] }),
        active ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", className: "pai-ideas-primary", disabled: disabled || !!editing, onClick: start, children: [
          "\u2727 ",
          t(pending ? "retry" : "startNow")
        ] }) : idea.execution ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", className: "pai-ideas-primary", onClick: () => api.openConversation(idea.execution.sessionId), children: [
          t("viewConversation"),
          " \u2192"
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: onClose, children: t("closeDetail") })
      ] })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "article",
    {
      className: "pai-ideas-card",
      "data-status": idea.status,
      "data-clickable": active && !disabled && !editing,
      onClick: (event) => {
        if (!event.target.closest("button,details,form,a,input,textarea")) onSelect();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-card-top", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "pai-ideas-number", children: [
            "IDEA ",
            String(index + 1).padStart(2, "0")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: `pai-ideas-badge pai-ideas-${idea.status}`, children: progressLabel(idea, t) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: active ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", className: "pai-ideas-card-link", disabled: disabled || !!editing, onClick: onSelect, children: [
          idea.title,
          " \u2197"
        ] }) : idea.title }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-description", children: idea.description }),
        idea.source !== "general" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "pai-ideas-goal", children: [
          t(idea.basis === "goal" ? "goalOrigin" : "memoryOrigin"),
          idea.goalRef && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            " \xB7 ",
            idea.goalRef.title
          ] })
        ] }),
        idea.goal && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "pai-ideas-goal", children: [
          t("relatedGoal"),
          " \xB7 ",
          idea.goal
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-reason", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t(idea.source === "general" ? "generalOrigin" : "why") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: idea.reason })
        ] }),
        idea.feedback?.some((item) => item.kind === "adjust") && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "pai-ideas-adjusted", children: [
          t("yourAdjustment"),
          "\uFF1A",
          idea.feedback.filter((item) => item.kind === "adjust").at(-1)?.note
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "pai-ideas-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: t(idea.source === "general" ? "generalEvidence" : "evidence") }),
          idea.evidence.map((text, n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("blockquote", { children: text }, n)),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: t("instruction") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-pre", children: idea.instruction }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: t("history") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { children: idea.history.map((event, n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("time", { children: formatDate(event.at) }),
            " \xB7 ",
            eventLabels[event.action] ? t(eventLabels[event.action]) : event.action,
            event.note && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
              " \xB7 ",
              event.note
            ] })
          ] }, n)) })
        ] }),
        pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "pai-ideas-pending", children: t("pending") }),
        idea.completion && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-completion", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { children: [
            "\u2713 ",
            t("completed")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: idea.completion.note }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("time", { children: formatDate(idea.completion.at) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GoalSyncStatus, { idea, api, t }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pai-ideas-card-actions", children: [
          idea.execution && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: onSelect, children: [
            t("viewProgress"),
            " \u2192"
          ] }),
          active && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", className: "pai-ideas-primary", disabled: disabled || !!editing, onClick: onSelect, children: [
            t("viewIdea"),
            " \u2192"
          ] }),
          idea.status === "suggested" && !pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => {
            void update("adopt");
          }, children: t("adopt") }),
          active && !pending && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => edit("adjust"), children: t("adjust") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "pai-ideas-quiet", disabled, onClick: () => edit("dismiss"), children: t("dismiss") })
          ] }),
          idea.status === "dismissed" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => {
            void update("restore");
          }, children: t("restore") }),
          idea.execution && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: () => api.openConversation(idea.execution.sessionId), children: [
            t("viewConversation"),
            " \u2192"
          ] }),
          idea.status === "started" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", disabled, onClick: () => edit("complete"), children: t("complete") })
        ] }),
        editor
      ]
    }
  );
}
function Bulb({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M9 18h6M9.5 21h5M8.2 14.4a6 6 0 1 1 7.6 0c-.8.6-.8 1.5-.8 2.6H9c0-1.1 0-2-.8-2.6Z" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12 2V.5M4 5 2.8 3.8M20 5l1.2-1.2M3 11H1.5M21 11h1.5" })
  ] });
}
function formatDate(value) {
  return new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" }).format(new Date(value));
}

// src/client/styles.ts
var styles = `
/* \u540C\u6392\u5361\u7247\u62C9\u4F38\u5230\u76F8\u540C\u9AD8\u5EA6\uFF1B\u9ED8\u8BA4\u81F3\u5C11 420px\uFF0C\u5185\u5BB9\u5C55\u5F00\u65F6\u81EA\u7136\u589E\u9AD8\u3002 */
.pai-ideas{--pai-bg:#f6f7f9;--pai-card:#fff;--pai-text:#202937;--pai-muted:#758092;--pai-border:#e5e9ee;--pai-accent:#3867df;box-sizing:border-box;height:100%;overflow:auto;background:var(--pai-bg);color:var(--pai-text);padding:36px clamp(20px,4vw,64px);font:14px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.pai-ideas *{box-sizing:border-box}.pai-ideas button,.pai-ideas input,.pai-ideas textarea{font:inherit}.pai-ideas button{border:1px solid var(--pai-border);border-radius:9px;padding:7px 13px;background:var(--pai-card);color:var(--pai-text);cursor:pointer;transition:background .15s}.pai-ideas button:hover{background:#edf2ff}.pai-ideas button:disabled{cursor:default;opacity:.48}.pai-ideas button:focus-visible,.pai-ideas input:focus-visible,.pai-ideas textarea:focus-visible,.pai-ideas summary:focus-visible{outline:2px solid var(--pai-accent);outline-offset:3px}
.pai-ideas .pai-ideas-primary{background:var(--pai-accent);border-color:var(--pai-accent);color:#fff}.pai-ideas .pai-ideas-primary:hover{background:#2e57bd}.pai-ideas-heading{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:25px}.pai-ideas-eyebrow{font-size:10px;letter-spacing:2.4px;color:var(--pai-muted);font-weight:650}.pai-ideas h1{display:flex;align-items:center;gap:11px;font-size:32px;line-height:1.3;letter-spacing:-1px;margin:6px 0}.pai-ideas h1 svg{color:var(--pai-accent)}.pai-ideas-heading p{margin:9px 0 0;color:var(--pai-muted)}.pai-ideas-heading-actions{flex-shrink:0}
.pai-ideas-compose{border:1px solid var(--pai-border);background:var(--pai-card);border-radius:14px;padding:18px 20px}.pai-ideas-compose label{display:block;font-size:12px;font-weight:600;margin-bottom:8px}.pai-ideas-compose>div{display:flex;gap:9px}.pai-ideas-compose input{min-width:0;flex:1;border:1px solid var(--pai-border);border-radius:8px;padding:9px 12px;color:var(--pai-text);background:var(--pai-bg)}.pai-ideas-compose small{display:block;color:var(--pai-muted);font-size:11px;margin-top:11px}.pai-ideas-target{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--pai-muted);padding:13px 3px;min-width:0}.pai-ideas-target strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;font-weight:500;color:var(--pai-text)}.pai-ideas-target i{width:6px;height:6px;border-radius:100%;background:#35a47e;flex-shrink:0}
.pai-ideas-toolbar{display:flex;justify-content:space-between;align-items:center;margin:12px 0 17px;gap:10px}.pai-ideas-filters{display:flex;gap:4px}.pai-ideas-filters button{border:0;background:none;font-size:12px;color:var(--pai-muted);padding:6px 10px}.pai-ideas-filters button[aria-pressed=true]{color:var(--pai-accent);background:#e8eefc;font-weight:600}.pai-ideas-toolbar>button{font-size:12px;background:transparent;border:0;color:var(--pai-muted)}.pai-ideas-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));align-items:stretch;gap:18px}
.pai-ideas-card{display:flex;flex-direction:column;min-height:420px;border:1px solid var(--pai-border);border-radius:16px;background:var(--pai-card);padding:22px;min-width:0;overflow-wrap:anywhere;box-shadow:0 3px 12px #1c294004}.pai-ideas-card-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.pai-ideas-number{font-size:10px;color:#8a95a6;letter-spacing:1.6px;font-weight:650}.pai-ideas-badge{font-size:10px;padding:3px 8px;border-radius:20px;white-space:nowrap;background:#f0f3f8;color:#63718a}.pai-ideas-suggested{background:#edf1ff;color:#5474d1}.pai-ideas-adopted{background:#fff4df;color:#ad7a21}.pai-ideas-started{background:#e9f3ff;color:#3179ba}.pai-ideas-completed{background:#e9f6ee;color:#34835b}.pai-ideas-card h2{font-size:18px;line-height:1.5;letter-spacing:-.3px;margin:17px 0 10px}.pai-ideas-description{color:var(--pai-muted);font-size:13px;margin:0 0 20px}.pai-ideas-reason{padding:13px 14px;background:var(--pai-bg);border-radius:10px}.pai-ideas-reason>span{font-size:10px;font-weight:650;letter-spacing:.3px;color:var(--pai-accent)}.pai-ideas-reason p{font-size:12px;margin:6px 0 0;color:var(--pai-text)}
.pai-ideas-details{font-size:11px;margin-top:16px;color:var(--pai-muted)}.pai-ideas-details summary{cursor:pointer;user-select:none}.pai-ideas-details blockquote{border-left:2px solid #b9c9f1;margin:12px 0;padding:2px 10px;white-space:pre-wrap}.pai-ideas-details h3{font-size:11px;color:var(--pai-text);margin:15px 0 7px}.pai-ideas-pre{white-space:pre-wrap}.pai-ideas-details ul{padding-left:16px}.pai-ideas-details li{margin:6px 0}.pai-ideas-card-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:21px}.pai-ideas-card-actions button{font-size:12px;padding:7px 12px}.pai-ideas .pai-ideas-quiet{margin-left:auto;border-color:transparent;color:var(--pai-muted)}.pai-ideas-error,.pai-ideas-notice{padding:11px 14px;border-radius:9px;font-size:12px;margin-bottom:13px}.pai-ideas-error{background:#fcecec;color:#ac3c3c}.pai-ideas-notice{background:#eaf4ee;color:#31734f}.pai-ideas-pending{font-size:11px;color:#a47824}.pai-ideas-completion{margin-top:15px;padding:12px;background:#edf7f1;border-radius:9px;color:#31734f;font-size:12px}.pai-ideas-completion p{white-space:pre-wrap;margin:7px 0}.pai-ideas-completion time{font-size:10px;opacity:.7}
.pai-ideas-finish{border-top:1px solid var(--pai-border);padding-top:15px;margin-top:15px;font-size:12px}.pai-ideas-finish label{display:block}.pai-ideas-finish textarea{display:block;width:100%;min-height:85px;resize:vertical;border:1px solid var(--pai-border);border-radius:8px;background:var(--pai-bg);color:var(--pai-text);padding:8px;margin:7px 0 12px}.pai-ideas-finish button+button{margin-left:8px}.pai-ideas-empty{display:flex;align-items:center;flex-direction:column;justify-content:center;min-height:240px;color:var(--pai-muted);text-align:center;padding:30px}.pai-ideas-empty svg{color:#a8b8dc}.pai-ideas-empty h2{font-size:16px;color:var(--pai-text);margin:16px 0 6px}.pai-ideas-empty p{max-width:300px;font-size:12px}.pai-ideas-foot{display:flex;gap:6px 18px;flex-wrap:wrap;color:var(--pai-muted);font-size:10px;margin-top:24px;padding:15px 2px;border-top:1px solid var(--pai-border);overflow-wrap:anywhere}
.pai-ideas-compact{padding:22px 16px}.pai-ideas-compact h1{font-size:25px}.pai-ideas-compact .pai-ideas-heading{align-items:flex-start;margin-bottom:20px}.pai-ideas-compact .pai-ideas-heading p{font-size:12px}.pai-ideas-compact .pai-ideas-heading-actions button{font-size:10px;padding:5px 7px}.pai-ideas-compact .pai-ideas-compose{padding:14px}.pai-ideas-compact .pai-ideas-compose>div{flex-direction:column}.pai-ideas-compact .pai-ideas-grid{grid-template-columns:1fr}.pai-ideas-compact .pai-ideas-card{padding:18px}.pai-ideas-compact .pai-ideas-filters{gap:0}.pai-ideas-compact .pai-ideas-filters button{padding:5px 8px;font-size:11px}.pai-ideas-entry{display:flex;align-items:center;gap:5px;color:inherit;border:0;background:none;cursor:pointer;font:inherit;font-size:12px;padding:4px 6px;border-radius:6px}
@media(max-width:640px){.pai-ideas:not(.pai-ideas-compact){padding:22px 16px}.pai-ideas-compose>div{flex-direction:column}.pai-ideas-heading-actions button{font-size:11px}.pai-ideas h1{font-size:27px}}
body[data-ds-dark-theme] .pai-ideas{--pai-bg:#191d25;--pai-card:#222833;--pai-text:#dfe5ee;--pai-muted:#929eb0;--pai-border:#343e4d;--pai-accent:#6f94f9}body[data-ds-dark-theme] .pai-ideas button:hover{background:#303b51}body[data-ds-dark-theme] .pai-ideas .pai-ideas-primary{color:#141d34}body[data-ds-dark-theme] .pai-ideas .pai-ideas-primary:hover{background:#8cacf9}body[data-ds-dark-theme] .pai-ideas-filters button[aria-pressed=true]{background:#2b3855}body[data-ds-dark-theme] .pai-ideas-error{background:#422b30;color:#f0afb2}body[data-ds-dark-theme] .pai-ideas-notice,body[data-ds-dark-theme] .pai-ideas-completion{background:#263f35;color:#9ad4b7}
@media(prefers-reduced-motion:reduce){.pai-ideas button{transition:none}}
.pai-ideas-engine{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;color:var(--pai-muted);font-size:11px;margin-bottom:10px}.pai-ideas-engine>span{display:flex;align-items:center;gap:7px}.pai-ideas-engine i{width:6px;height:6px;background:#35a47e;border-radius:50%}.pai-ideas-engine i.working{background:#d09d45}.pai-ideas-engine time{font-size:10px}.pai-ideas-background-error{font-size:11px;color:var(--pai-muted)}.pai-ideas-new{width:100%;text-align:left;margin:8px 0;color:var(--pai-accent)!important}.pai-ideas-compose{margin-top:25px}.pai-ideas-compose summary{cursor:pointer;font-size:12px;color:var(--pai-muted)}.pai-ideas-compose[open] summary{margin-bottom:15px}.pai-ideas-card[data-clickable=true]{cursor:pointer}.pai-ideas-card[data-clickable=true]:hover{border-color:var(--pai-accent)}.pai-ideas button.pai-ideas-card-link{display:block;text-align:left;font:inherit;font-weight:inherit;border:0;background:none;padding:0;color:inherit;width:100%}.pai-ideas button.pai-ideas-card-link:hover{color:var(--pai-accent);background:none}.pai-ideas-goal{font-size:11px;color:var(--pai-accent);margin:-5px 0 16px}.pai-ideas-adjusted{font-size:11px;color:var(--pai-muted)}.pai-ideas-more{margin-top:15px;font-size:12px!important}
.pai-ideas.pai-ideas-detail-root{padding:28px;background:var(--pai-bg)}.pai-ideas-sheet{display:flex;flex-direction:column;width:100%;max-width:680px;margin:0 auto;background:var(--pai-card);border-radius:16px;box-shadow:0 4px 24px #00000008}.pai-ideas-sheet-footer{border-radius:0 0 16px 16px}.pai-ideas-compact.pai-ideas-detail-root{padding:0;background:var(--pai-card)}.pai-ideas-compact .pai-ideas-sheet{min-height:100%;border-radius:0;box-shadow:none}.pai-ideas-sheet-header{display:flex;align-items:flex-start;gap:15px;padding:18px 20px 8px}.pai-ideas-sheet-header h2{font-size:18px;line-height:1.5;margin:0;flex:1}.pai-ideas-sheet-header>button{width:34px;height:34px;border:0;border-radius:50%;padding:0;font-size:23px;box-shadow:0 2px 12px #00000012;flex-shrink:0}.pai-ideas-sheet-body{padding:0 20px 20px;flex:1}.pai-ideas-sheet-intro,.pai-ideas-sheet-how{color:var(--pai-muted);font-size:15px;line-height:1.7;margin:10px 0 20px}.pai-ideas-sheet h3{font-size:16px;margin:22px 0 10px}.pai-ideas-includes{list-style:none;padding:0;margin:0}.pai-ideas-includes li{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid var(--pai-border)}.pai-ideas-includes li:last-child{border-bottom:0}.pai-ideas-include-icon{display:grid;place-items:center;border-radius:50%;background:var(--pai-bg);width:44px;height:44px;font-size:24px;flex-shrink:0}.pai-ideas-includes li>div{flex:1;min-width:0}.pai-ideas-includes strong{font-size:14px;font-weight:600}.pai-ideas-includes p{font-size:13px;color:var(--pai-muted);margin:2px 0 0}.pai-ideas-included{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#008916;color:white;font-size:13px;flex-shrink:0}.pai-ideas-sheet-footer{position:sticky;bottom:0;display:flex;align-items:center;gap:10px;background:var(--pai-card);padding:10px 16px 16px;z-index:2}.pai-ideas-sheet-footer>.pai-ideas-primary{flex:1;border-radius:28px;min-height:45px;background:#0062ce;border-color:#0062ce;font-weight:600}.pai-ideas-sheet-menu{position:relative}.pai-ideas-sheet-menu>summary{list-style:none;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;box-shadow:0 2px 12px #00000010;cursor:pointer;font-weight:700}.pai-ideas-sheet-menu>summary::-webkit-details-marker{display:none}.pai-ideas-sheet-menu>div{position:absolute;bottom:54px;left:0;padding:10px;min-width:220px;width:min(320px,75vw);max-height:65vh;overflow:auto;background:var(--pai-card);box-shadow:0 6px 30px #00000020;border:1px solid var(--pai-border);border-radius:12px;font-size:12px;overflow-wrap:anywhere}.pai-ideas-sheet-menu>div>button{display:block;width:100%;border:0;text-align:left}.pai-ideas-sheet-menu>div>details{padding:8px}.pai-ideas-sheet-menu blockquote{margin:8px 0;color:var(--pai-muted);white-space:pre-wrap}.pai-ideas-chat-reference{display:flex;flex-direction:column;align-items:flex-end;margin:4px 0 -5px auto;max-width:85%;color:#7d8085;font:13px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.pai-ideas-chat-reference>span{font-size:11px;margin:0 12px 5px}.pai-ideas-chat-reference blockquote{background:#eeeeef;border-radius:23px;margin:0;padding:12px 17px;overflow-wrap:anywhere;max-width:100%}body[data-ds-dark-theme] .pai-ideas-chat-reference{color:#acb5c2}body[data-ds-dark-theme] .pai-ideas-chat-reference blockquote{background:#2b3039}
/* \u64CD\u4F5C\u533A\u8D34\u9F50\u5361\u7247\u5E95\u90E8\uFF0C\u9884\u7559\u4E0E\u6B63\u6587\u7684\u95F4\u8DDD\uFF1B\u540C\u6B65\u72B6\u6001\u540C\u65F6\u652F\u6301\u6982\u89C8\u548C\u8BE6\u60C5\u3002 */
.pai-ideas-grid>.pai-ideas-card>.pai-ideas-card-actions{margin-top:auto;padding-top:21px}.pai-ideas-goal-sync{font-size:12px;color:var(--pai-accent);margin:12px 0}.pai-ideas-goal-sync p{margin:0 0 5px}.pai-ideas-goal-sync small{display:block;color:var(--pai-muted);margin-bottom:8px}
/* \u901A\u7528\u70B9\u5B50\u91C7\u7528\u56FE\u6807\u3001\u6807\u9898\u4E0E\u7070\u8272\u7B80\u4ECB\u7684\u5217\u8868\u5E03\u5C40\uFF1B\u72EC\u7ACB\u9875\u548C\u7A84\u4FA7\u680F\u5171\u4EAB\u4E3B\u9898\u53D8\u91CF\u3002 */
.pai-ideas-general{border-top:1px solid var(--pai-border);margin-top:34px;padding-top:24px}.pai-ideas-general-heading{font-size:14px;font-weight:600;margin:0}.pai-ideas-general-hint{color:var(--pai-muted);font-size:12px;margin:4px 0 24px}.pai-ideas-general section{margin:25px 0 34px}.pai-ideas-general h2{font-size:20px;margin:0 0 12px}.pai-ideas button.pai-ideas-general-row{display:flex;align-items:flex-start;gap:18px;width:100%;text-align:left;border:0;background:transparent;padding:16px 10px;border-radius:12px}.pai-ideas button.pai-ideas-general-row:hover{background:var(--pai-card)}.pai-ideas-general-icon{font-size:30px;line-height:1.4;flex:0 0 40px;text-align:center}.pai-ideas-general-copy{flex:1;min-width:0}.pai-ideas-general-copy strong{display:block;font-size:15px;font-weight:600;line-height:1.6;margin-bottom:3px}.pai-ideas-general-copy>span{display:block;color:var(--pai-muted);font-size:13px;line-height:1.8;overflow-wrap:anywhere}.pai-ideas-general-row>span:last-child{color:var(--pai-muted);font-size:22px}.pai-ideas-general-needs{padding-left:20px;color:var(--pai-muted);font-size:14px}.pai-ideas-general-needs li{margin:8px 0}.pai-ideas-compact .pai-ideas-general h2{font-size:17px}.pai-ideas-compact button.pai-ideas-general-row{gap:10px;padding:14px 2px}.pai-ideas-compact .pai-ideas-general-icon{font-size:25px;flex-basis:30px}.pai-ideas-compact .pai-ideas-general-copy strong{font-size:14px}.pai-ideas-compact .pai-ideas-general-copy>span{font-size:12px}

/* \u8FDB\u5EA6\u5185\u5BB9\u5728\u8BE6\u60C5\u5185\u4FDD\u6301\u53EF\u8BFB\uFF1B\u7A84\u5C4F\u7B5B\u9009\u680F\u5141\u8BB8\u6362\u884C\uFF0C\u6784\u4EF6\u8DEF\u5F84\u4E0D\u4F1A\u6324\u51FA\u9875\u9762\u3002 */
.pai-ideas-progress{margin-top:24px;border-top:1px solid var(--pai-border);padding-top:6px;overflow-wrap:anywhere}.pai-ideas-progress-state{display:inline-block;color:var(--pai-accent);padding:5px 0}.pai-ideas-progress p{font-size:13px}.pai-ideas-progress-box{border:1px solid var(--pai-border);border-radius:10px;padding:13px;margin:12px 0;background:var(--pai-bg)}.pai-ideas-progress small{display:block;font-size:11px;color:var(--pai-muted);white-space:normal}.pai-ideas-progress code{white-space:pre-wrap;overflow-wrap:anywhere}.pai-ideas-filters{flex-wrap:wrap}.pai-ideas-progress .pai-ideas-details ol{padding-left:20px}.pai-ideas-progress .pai-ideas-details li{margin:10px 0}
`;

// src/client/chat.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var ideaReferenceDefinition = {
  kind: "personal-ideas-reference",
  target: "chat",
  match: (event) => event.type === "user/message" && isRecord(event.data.source) && event.data.source.kind === HANDOFF_SOURCE && typeof event.data.source.title === "string" && typeof event.data.source.ideaId === "string" ? { id: String(event.data.id), role: "start" } : null,
  start: (_context, match) => {
    if (match.event.type !== "user/message") throw new Error("Ideas \u5F15\u7528\u7F3A\u5C11\u4E0A\u4E0B\u6587\u6D88\u606F\u3002");
    const source = match.event.data.source;
    return { title: source.title, ideaId: source.ideaId, seq: match.event.seq };
  },
  update: (context) => context.state,
  buildViewNode: (context) => context.state ? {
    key: context.key,
    id: context.id,
    target: "chat",
    kind: "personal-ideas-reference",
    anchorSeq: context.state.seq,
    // 引用独立于执行过程折叠，原始事件仍保留真实回合位置与完整资料供轨迹查看。
    location: { kind: "session" },
    visibility: "visible",
    data: { title: context.state.title, ideaId: context.state.ideaId }
  } : null
};
function registerIdeasChat(ctx) {
  ctx.effect(() => ctx.uiConversation.events.register(ideaReferenceDefinition), "ideas.chat-reference");
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "personal-ideas-reference",
    locale: "personalIdeas"
  }, IdeaReference));
}
function IdeaReference({ node, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "pai-ideas-chat-reference", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      "\u21A9 ",
      t("selectedIdea")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("blockquote", { children: node.data.title })
  ] });
}

// src/client/index.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var NS = "personalIdeas";
var PANEL = "personal-ideas";
var TAB = "@personal-ai/ideas-dsh-plugin";
var inject = ["slots", "locale", "connection", "layout", "sidebarRightTabs", "sidebarRight", "uiSession", "uiWorkspace", "sessions", "uiConversation"];
function apply(ctx) {
  const sessions = ctx.get("sessions");
  const api = createIdeasApi(ctx.get("connection").rpc, {
    createSession: () => sessions.create(),
    openSession: (id) => {
      ctx.uiWorkspace.openSession(id);
      if (ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
    }
  });
  const t = ctx.locale.bind(NS);
  registerIdeasChat(ctx);
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), "ideas.locale");
  ctx.effect(() => () => api.dispose(), "ideas.api");
  ctx.effect(() => {
    const element = document.createElement("style");
    element.dataset.pluginCss = TAB;
    element.textContent = styles;
    document.head.appendChild(element);
    return () => element.remove();
  }, "ideas.styles");
  const injected = () => ({
    api,
    current: ctx.uiSession.adapter.current,
    onOpen: () => ctx.layout.selectPanel(PANEL),
    onBack: () => ctx.layout.selectPanel(null)
  });
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: TAB,
    kind: "ideas",
    priority: "extension",
    title: () => t("title"),
    guide: [{ id: "ideas", order: 30, title: () => t("title"), description: () => t("compactSubtitle"), icon: Bulb }]
  }), "ideas.tab");
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL, locale: NS, inject: injected }, MainPage));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL,
    order: 20,
    locale: NS,
    label: () => t("title")
  }, Bulb));
  ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
    name: "sidebar.right.pane.tab",
    key: TAB,
    locale: NS,
    inject: injected
  }, SidebarPage));
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register(
    {
      name: "conversation.session.header.utilities",
      id: "personal-ideas",
      order: -4,
      locale: NS,
      inject: () => ({ open: () => {
        ctx.sidebarRight.openTab("ideas");
      } })
    },
    ({ open, t: t2 }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "button",
      {
        type: "button",
        className: "pai-ideas-entry",
        onClick: open,
        title: t2("open"),
        "aria-label": t2("open"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Bulb, { size: 18 }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: t2("title") })
        ]
      }
    )
  ));
  ctx.on("connection/reset", () => {
    void api.refresh();
  });
}
function MainPage(props) {
  const sessionId = (0, import_react3.useSyncExternalStore)((listener) => props.current.subscribe(listener), () => props.current.getSnapshot().key);
  const label = props.useSessions((state) => sessionId ? state.byId[sessionId]?.displayTitle : void 0);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(IdeasPanel, { api: props.api, t: props.t, sessionId, sessionLabel: label, onBack: props.onBack });
}
function SidebarPage(props) {
  const label = props.useSessions((state) => state.byId[props.sessionId]?.displayTitle);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(IdeasPanel, { api: props.api, t: props.t, sessionId: props.sessionId, sessionLabel: label, compact: true, onOpen: props.onOpen });
}

return module.exports;}});

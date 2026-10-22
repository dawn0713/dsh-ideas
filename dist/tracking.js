/** 从真实会话事件、产物和宿主排程维护目标进度；模型报告只提供语义解释。 */
import { stat, access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve, isAbsolute } from "node:path";
import { GENERAL_IDEAS } from "./catalog.js";
import { isRecord, HANDOFF_SOURCE, START_TEXT } from "./types.js";
import { GoalFeedback, queueGoalFeedback } from "./goal-feedback.js";
/** 初始化时不补造历史成功；旧版已交接任务保持待核对。 */
export function initialProgress(idea, legacy = false) {
    const template = GENERAL_IDEAS.find(item => item.id === idea.templateId);
    return { lifecycle: "active", run: legacy ? "review" : "queued", summary: legacy ? "已交接，历史执行状态待核对。" : "任务已提交，等待 DSH 开始执行。",
        nextStep: "", mode: template?.mode ?? "once", completionRule: template?.completionRule ?? idea.instruction,
        lastSeq: -1, requests: [], artifacts: [], activity: [], followUp: { state: "off", ids: [] } };
}
/** 状态写入与卡片共用队列；每条活动标注事实来源，避免把无更新当作完成。 */
export class IdeasTracker {
    store;
    services;
    timezone;
    owners = new Map();
    turns = new Map();
    feedback;
    constructor(store, services, timezone) {
        this.store = store;
        this.services = services;
        this.timezone = timezone;
        this.feedback = new GoalFeedback(store, services);
    }
    key(sessionId, turn) { return `${sessionId}:${turn}`; }
    bind(idea, turn) {
        const key = this.key(idea.execution.sessionId, turn);
        const owners = this.owners.get(key) ?? new Set();
        owners.add(idea.id);
        this.owners.set(key, owners);
    }
    /** 首次载入只读历史，不启动 Agent；漏掉的事件按序重放，已处理事件不重复记账。 */
    async recover() {
        const ideas = await this.store.transaction(() => this.store.list());
        for (const id of new Set(ideas.filter(i => i.status === "started" && i.execution).map(i => i.execution.sessionId))) {
            let events;
            // 单个会话被删除或暂不可读不阻断其他目标恢复，也不补造成功。
            try {
                events = await this.services.readEvents?.(id);
            }
            catch {
                events = undefined;
            }
            await this.store.transaction(async () => {
                for (const idea of (await this.store.list()).filter(i => i.status === "started" && i.execution?.sessionId === id && !i.progress)) {
                    idea.progress = initialProgress(idea, true);
                    idea.progress.lastSeq = events?.at(-1)?.seq ?? -1;
                    this.activity(idea, idea.progress.summary, "版本迁移");
                    await this.store.save(idea);
                }
            });
            if (events)
                for (const event of events)
                    await this.capture(id, event);
            else
                await this.store.transaction(async () => {
                    for (const idea of (await this.store.list()).filter(i => i.execution?.sessionId === id && i.progress?.lifecycle === "active" && i.progress.run === "running")) {
                        idea.progress.run = "interrupted";
                        idea.progress.summary = "无法读取完整会话，执行状态待核对。";
                        this.activity(idea, idea.progress.summary, "恢复检查");
                        await this.store.save(idea);
                    }
                });
        }
        await this.reconcile();
        await this.feedback.recover();
    }
    /** 仅请求、上下文或宿主排程能绑定任务；同一聊天中的普通消息不隐式归给某个目标。 */
    async capture(sessionId, event) {
        if (!isRecord(event.data))
            return;
        if (event.type === "turn/start" && Number.isInteger(event.data.turn))
            this.turns.set(sessionId, Number(event.data.turn));
        // DSH 的 user/message 本身没有 turn；按真实 turn/start 的日志位置确定归属。
        const data = event.type === "user/message" && event.data.turn === undefined
            ? { ...event.data, turn: this.turns.get(sessionId) } : event.data;
        await this.store.transaction(async () => {
            const ideas = (await this.store.list()).filter(i => i.execution?.sessionId === sessionId && i.progress);
            if (event.type === "user/message" && Number.isInteger(data.turn) && isRecord(data.source)) {
                const source = data.source;
                const text = Array.isArray(data.content) ? data.content.flatMap(p => isRecord(p) && p.type === "text" ? [p.text] : []).join("\n") : "";
                for (const idea of ideas) {
                    const p = idea.progress;
                    if ((source.kind === HANDOFF_SOURCE && source.ideaId === idea.id)
                        || (source.kind === "user" && (source.rpcId === idea.execution.requestId || p.requests.includes(String(source.rpcId))))
                        || (source.kind === "schedule" && text.includes(`【Ideas:${idea.id}】`)))
                        this.bind(idea, Number(data.turn));
                }
            }
            const owners = Number.isInteger(data.turn) ? this.owners.get(this.key(sessionId, Number(data.turn))) : undefined;
            // 审批事件本身没有 turn，使用它引用的 callId 定位；不猜测无归属的工具事件。
            const bound = owners?.size === 1 ? ideas.find(i => owners.has(i.id)) : undefined;
            for (const idea of ideas) {
                const p = idea.progress;
                if (event.seq <= p.lastSeq || p.lifecycle !== "active")
                    continue;
                let summary = "";
                if (bound?.id === idea.id) {
                    p.turn = Number(data.turn);
                    if (event.type === "user/message") {
                        p.run = "running";
                        summary = "DSH 已开始处理本项任务。";
                    }
                    if (event.type === "tool/call") {
                        p.run = data.name === "ask_user_question" ? "waiting_input" : "running";
                        summary = data.name === "ask_user_question" ? "正在等待你补充关键资料。" : `正在调用工具：${String(data.name)}。`;
                    }
                    if (event.type === "tool/result" && isRecord(data.message) && data.message.isError) {
                        p.run = "failed";
                        summary = "工具执行失败，目标仍未完成。";
                    }
                    else if (event.type === "tool/result" && p.run === "waiting_approval") {
                        p.run = "running";
                        summary = "具体操作已返回，正在核对结果。";
                    }
                    if (event.type === "deliverables/presented" && Array.isArray(data.files)) {
                        for (const f of data.files)
                            if (isRecord(f) && typeof f.path === "string" && !p.artifacts.some(a => a.path === f.path && a.seq === event.seq))
                                p.artifacts.push({ path: f.path, seq: event.seq, at: new Date(event.time).toISOString() });
                        p.artifacts = p.artifacts.slice(-30);
                        summary = "DSH 已展示阶段产物，等待完成口径核验。";
                    }
                    if (event.type === "turn/end" && isRecord(data.reason)) {
                        const kind = data.reason.kind;
                        if (["error", "aborted", "interrupted", "max-tokens", "blocked"].includes(String(kind))) {
                            p.run = kind === "error" ? "failed" : "interrupted";
                            summary = "本轮执行失败或中断，目标仍未完成。";
                        }
                        else if (p.followUp.state === "active" && !["waiting_input", "waiting_approval", "waiting_external", "failed"].includes(p.run)) {
                            p.run = "tracking";
                            summary = "本轮执行结束，继续按排程跟踪。";
                        }
                        else if (!["waiting_input", "waiting_approval", "waiting_external", "failed"].includes(p.run)) {
                            p.run = "review";
                            summary = "本轮结束，尚未核验整体完成。";
                        }
                    }
                }
                if (event.type.startsWith("approval/")) {
                    // callId 由后续完整日志核对；审批事件不能仅凭聊天相同就归给任务。
                    const events = await this.services.readEvents?.(sessionId);
                    const asked = event.type === "approval/asked" ? event : events?.find(e => e.type === "approval/asked" && isRecord(e.data) && e.data.id === data.id);
                    const callId = asked && isRecord(asked.data) ? asked.data.callId : undefined;
                    const call = callId === undefined ? undefined : events?.find(e => e.type === "tool/call" && isRecord(e.data) && e.data.callId === callId);
                    const turn = call && isRecord(call.data) ? Number(call.data.turn) : undefined;
                    const targets = turn === undefined ? undefined : this.owners.get(this.key(sessionId, turn));
                    if (targets?.size === 1 && targets.has(idea.id)) {
                        p.run = event.type === "approval/asked" ? "waiting_approval" : data.outcome === "allowed-once" ? "running" : "waiting_input";
                        summary = event.type === "approval/asked" ? "具体操作正在等待你的审批。" : data.outcome === "allowed-once" ? "审批通过，继续核对执行结果。" : "操作未获批准，等待调整处理方式。";
                    }
                }
                p.lastSeq = event.seq;
                if (summary) {
                    p.summary = summary;
                    this.activity(idea, summary, event.type, event.seq);
                }
                await this.store.save(idea);
            }
        });
    }
    /** 模型必须在当前已绑定回合报告；证据须来自该回合，不能借用别的任务或历史产物。 */
    async report(sessionId, input, events) {
        if (!isRecord(input) || typeof input.idea_id !== "string" || typeof input.summary !== "string" || !input.summary.trim() || input.summary.length > 2000
            || !["inspect", "running", "waiting_input", "waiting_external", "tracking", "completed"].includes(String(input.state)))
            throw new Error("进度报告参数无效。");
        let currentTurn;
        events = events.map(event => {
            if (event.type === "turn/start" && isRecord(event.data))
                currentTurn = Number(event.data.turn);
            return event.type === "user/message" && isRecord(event.data) && event.data.turn === undefined
                ? { ...event, data: { ...event.data, turn: currentTurn } } : event;
        });
        // 工具调用发生前的日志比异步观察器更新更及时，先按序补齐。
        for (const event of events)
            await this.capture(sessionId, event);
        const result = await this.store.transaction(async () => {
            const idea = await this.store.read(String(input.idea_id));
            const p = idea.progress;
            const turn = [...events].reverse().find(e => e.type === "turn/start");
            const turnId = turn && isRecord(turn.data) ? Number(turn.data.turn) : undefined;
            if (!p || idea.execution?.sessionId !== sessionId || p.lifecycle !== "active" || turnId === undefined)
                throw new Error("当前回合没有绑定这项 Ideas 任务，请从任务页补充进展或继续执行。");
            const owners = this.owners.get(this.key(sessionId, turnId));
            const humanEvents = events.filter(e => e.type === "user/message" && isRecord(e.data) && e.data.turn === turnId
                && isRecord(e.data.source) && e.data.source.kind === "user");
            if (input.state === "inspect")
                return JSON.stringify({ ideaId: idea.id, progress: p,
                    binding: { bound: owners?.has(idea.id) ?? false, userMessageSeqs: humanEvents.map(e => e.seq),
                        instruction: "普通聊天继续同一目标时，evidence_seqs 引用本轮用户消息即可关联，无需重复提供 user_update_seq。进度更新失败最多修正一次，随后直接交付正文及构件，单独说明记录状态。" },
                    evidence: events.filter(e => isRecord(e.data) && e.data.turn === turnId && ["tool/result", "deliverables/presented", "user/message"].includes(e.type))
                        .filter(e => e.type !== "user/message" || (isRecord(e.data) && isRecord(e.data.source) && e.data.source.kind === "user"))
                        .slice(-30).map(e => ({ seq: e.seq, type: e.type, detail: JSON.stringify(e.data).slice(0, 1600) })) });
            const seqs = input.evidence_seqs ?? [];
            // 引用的同轮用户消息已能说明交接归属，不再要求另传同一个编号。
            // 先完整校验全部证据，再建立绑定，错误报告不改变其他任务的归属。
            if (!Array.isArray(seqs) || seqs.length > 20 || !seqs.every(n => Number.isInteger(n) && events.some(e => e.seq === n && isRecord(e.data) && e.data.turn === turnId)))
                throw new Error("引用的事件不属于本轮任务，不能用于完成核验。请直接交付已有成果，进度记录可稍后核对。");
            if (!owners?.has(idea.id)) {
                const update = humanEvents.find(e => e.seq === input.user_update_seq) ?? humanEvents.find(e => seqs.includes(e.seq));
                if (!update || owners?.size)
                    throw new Error("当前回合没有绑定这项 Ideas 任务。若确为用户继续本目标，请在 evidence_seqs 引用 inspect 返回的本轮用户消息编号；最多修正一次，失败后仍须直接回复并交付成果。");
                this.bind(idea, turnId);
                this.activity(idea, "Agent 将本轮用户更新明确关联到此目标，原文可在关联会话核对。", "会话用户更新归属报告", update.seq);
            }
            p.turn = turnId;
            p.summary = String(input.summary).trim();
            // 普通聊天在本次报告中才绑定时，补记此前已真实交付且被引用的构件。
            for (const event of events.filter(e => seqs.includes(e.seq) && e.type === "deliverables/presented" && isRecord(e.data))) {
                if (!isRecord(event.data) || !Array.isArray(event.data.files))
                    continue;
                for (const file of event.data.files)
                    if (isRecord(file) && typeof file.path === "string"
                        && ((owners?.size ?? 1) <= 1 || file.path.includes(idea.id))
                        && !p.artifacts.some(a => a.path === file.path && a.seq === event.seq))
                        p.artifacts.push({ path: file.path, seq: event.seq, at: new Date(event.time).toISOString() });
            }
            p.artifacts = p.artifacts.slice(-30);
            p.nextStep = typeof input.next_step === "string" ? input.next_step.slice(0, 2000) : "";
            p.run = input.state === "completed" ? "review" : input.state;
            if (input.state === "tracking") {
                const template = GENERAL_IDEAS.find(x => x.id === idea.templateId);
                const cron = typeof input.followup_cron === "string" ? input.followup_cron.trim() : template?.defaultCron;
                const at = typeof input.followup_at === "string" ? validDate(input.followup_at) : undefined;
                let until = typeof input.followup_until === "string" ? validDate(input.followup_until) : undefined;
                if (at && cron && input.followup_cron)
                    throw new Error("跟进时间只能选择一次性时间或周期规则。");
                if (["general-01", "general-12", "general-16", "general-17"].includes(idea.templateId ?? "") && !until)
                    throw new Error("请复用已知的计划结束日期；缺失时集中补齐，再提交跟进截止时间。");
                if (idea.templateId === "general-14" && !until)
                    until = new Date(Date.now() + 7 * 86400000).toISOString();
                if (!at && !cron)
                    throw new Error("请根据已知日期直接指定跟进时间，不要询问用户是否需要设置提醒。");
                if (until && Date.parse(until) <= Date.now())
                    throw new Error("跟进截止时间已经过去，请核对目标是否已结束。");
                const rule = { ...(at ? { at } : { cron }), ...(until ? { until } : {}) };
                if (p.followUp.rule && JSON.stringify(p.followUp.rule) !== JSON.stringify(rule))
                    await this.stop(idea, "off");
                p.followUp.rule = rule;
                // 先保存排程意图，避免宿主写入成功但插件保存前退出后失去关联。
                await this.store.save(idea);
                await this.ensureSchedule(idea);
                if (p.followUp.state !== "active")
                    p.run = "failed";
            }
            if (input.state === "completed") {
                // 产物存在只证明已交付；模型还须报告符合本项口径。长期/外部结果不能靠一个文件自动结束。
                const presented = events.filter(e => seqs.includes(e.seq) && e.type === "deliverables/presented" && isRecord(e.data));
                const files = presented.flatMap(e => isRecord(e.data) && Array.isArray(e.data.files) ? e.data.files.filter(isRecord).map(f => f.path).filter((s) => typeof s === "string") : []);
                const directory = await this.services.workingDirectory?.(sessionId);
                const checks = await Promise.all(files.map(async (file) => {
                    if (!isAbsolute(file) && !directory)
                        return false;
                    const path = resolve(directory ?? process.cwd(), file);
                    try {
                        await access(path, constants.R_OK);
                        const info = await stat(path);
                        return info.isFile() && info.size > 0;
                    }
                    catch {
                        return false;
                    }
                }));
                // 同回合同时交接多项任务时，只有含目标编号的独立文件可以自动归属。
                const isolated = (owners?.size ?? 1) <= 1 || files.every(file => file.includes(idea.id));
                const userReceipt = input.completion_kind === "user_update" && events.find(e => (e.seq === input.user_update_seq || seqs.includes(e.seq)) && e.type === "user/message"
                    && isRecord(e.data) && e.data.turn === turnId && isRecord(e.data.source) && e.data.source.kind === "user"
                    && e.data.source.rpcId !== idea.execution.requestId && Array.isArray(e.data.content)
                    && e.data.content.some(part => isRecord(part) && typeof part.text === "string" && part.text.trim() && part.text.trim() !== START_TEXT));
                if ((p.mode === "once" && input.completion_kind === "artifact" && files.length > 0 && checks.every(Boolean) && isolated) || userReceipt) {
                    await this.stop(idea, "ended");
                    p.lifecycle = "completed";
                    idea.status = "completed";
                    idea.completion = { at: new Date().toISOString(), note: p.summary };
                    p.lastVerifiedAt = idea.completion.at;
                    this.activity(idea, userReceipt ? "根据关联聊天中用户明确的完成更新收尾，原文可核对。" : "完成口径报告及真实产物核验通过，自动完成。", userReceipt ? "用户完成更新归属报告" : "产物核验", userReceipt ? userReceipt.seq : undefined);
                }
                else {
                    p.run = "review";
                    p.nextStep ||= "需补充可核实的结果；阶段交付不代表长期目标达成。";
                }
            }
            queueGoalFeedback(idea);
            this.activity(idea, p.summary, "任务结构化报告");
            await this.store.save(idea);
            return JSON.stringify({ ideaId: idea.id, lifecycle: p.lifecycle, state: p.run, followUp: p.followUp, nextStep: p.nextStep });
        });
        // inspect 保持只读；正式报告在完成记录落盘后再回写 Goals。
        if (input.state === "inspect")
            return result;
        const goalSync = await this.feedback.send(String(input.idea_id));
        return JSON.stringify({ ...JSON.parse(result), ...(goalSync ? { goalSync } : {}) });
    }
    /** UI 操作必须真正停止关联排程；操作失败时保留原状态并显示错误。 */
    async control(idea, action) {
        const p = idea.progress ??= initialProgress(idea, true);
        if (action === "resume") {
            if (p.lifecycle !== "paused")
                throw new Error("只有已暂停任务可以恢复。");
            if (p.followUp.rule)
                await this.ensureSchedule(idea);
            if (p.followUp.state === "error")
                throw new Error(p.followUp.error);
            p.lifecycle = "active";
            p.run = p.followUp.state === "active" ? "tracking" : "review";
        }
        else {
            await this.stop(idea, action === "pause" ? "paused" : "ended");
            p.lifecycle = action === "pause" ? "paused" : action === "stop" ? "stopped" : "completed";
        }
        p.summary = action === "pause" ? "后续排程已暂停；已进入队列或正在执行的工作需在原会话核对。"
            : action === "resume" ? "已恢复目标及必要的后续跟踪。" : action === "stop" ? "已结束后续跟踪，不代表目标达成。" : "用户确认整体目标完成。";
        this.activity(idea, p.summary, "用户操作");
    }
    /** 真实 catalog 是跟踪状态依据；丢失任务明确报错，不自动重复补建。 */
    async reconcile() {
        await this.store.transaction(async () => {
            for (const idea of (await this.store.list()).filter(i => i.progress?.followUp.rule && i.progress.lifecycle === "active")) {
                const p = idea.progress, f = p.followUp;
                try {
                    if (f.rule?.until && Date.parse(f.rule.until) <= Date.now()) {
                        await this.stop(idea, "ended");
                        p.run = "review";
                        p.summary = "跟进期限已到，排程已结束；目标结果待核对。";
                        this.activity(idea, p.summary, "期限检查");
                    }
                    else if (["active", "error", "off"].includes(f.state)) {
                        const entries = await this.catalog(idea);
                        const own = entries.filter(e => e.status === "active");
                        if (own.length) {
                            f.state = "active";
                            f.ids = own.map(e => e.id);
                            f.nextAt = own.map(e => e.scheduledAt).sort()[0];
                            delete f.error;
                        }
                        else {
                            f.state = "error";
                            delete f.nextAt;
                            f.error = "关联排程已结束或不可读取，请核对自动化任务。";
                            if (p.run === "tracking") {
                                p.run = "review";
                                p.summary = "后续排程不可用，跟踪状态待核对。";
                            }
                        }
                    }
                }
                catch (error) {
                    f.state = "error";
                    f.error = errorText(error);
                }
                await this.store.save(idea);
            }
        });
    }
    /** 唯一标记写入真实排程，可在写后崩溃时通过 catalog 找回，避免重复创建。 */
    async ensureSchedule(idea) {
        const f = idea.progress.followUp;
        try {
            const scheduler = this.services.scheduler?.();
            if (!scheduler)
                throw new Error("DSH 排程服务尚未接入，未创建定时任务。");
            let own = (await this.catalog(idea)).filter(e => e.status === "active");
            if (!own.length) {
                const rule = f.rule;
                const prompt = `【Ideas:${idea.id}】继续同一目标：${idea.title}。\n${trackingInstruction(idea)}\n每次只记录实际可读回的变化；无变化时保持安静。有重要变化、失败、完成或需要关键资料时再通知。不要重新询问是否需要建立提醒。`;
                const created = await scheduler.create(idea.execution.sessionId, { title: `Ideas 跟进：${idea.title}`.slice(0, 120), prompt,
                    ...(rule.at ? { at: rule.at } : { cron: { expression: rule.cron, time_zone: this.timezone } }) });
                f.ids = [...new Set([...f.ids, created.id])];
                own = (await this.catalog(idea)).filter(e => e.status === "active");
            }
            if (!own.length)
                throw new Error("排程提交后未能读回，创建结果待核对。");
            f.ids = own.map(e => e.id);
            f.nextAt = own.map(e => e.scheduledAt).sort()[0];
            f.state = "active";
            delete f.error;
            this.activity(idea, `真实跟进任务已核实，下次检查：${f.nextAt}。`, "DSH 排程读回");
        }
        catch (error) {
            f.state = "error";
            f.error = errorText(error);
        }
    }
    async catalog(idea) {
        const scheduler = this.services.scheduler?.();
        if (!scheduler)
            throw new Error("DSH 排程服务不可用，状态待核对。");
        return (await scheduler.catalog()).filter(e => e.sessionId === idea.execution.sessionId && e.prompt.includes(`【Ideas:${idea.id}】`));
    }
    async stop(idea, state) {
        const f = idea.progress.followUp;
        if (f.ids.length || f.rule || this.services.scheduler?.()) {
            const own = await this.catalog(idea), scheduler = this.services.scheduler();
            for (const entry of own)
                await scheduler.delete({ sessionId: idea.execution.sessionId, id: entry.id });
            if ((await this.catalog(idea)).some(e => e.status === "active"))
                throw new Error("关联排程尚未停止，不能显示已暂停或已完成。");
        }
        f.state = state;
        f.ids = [];
        delete f.nextAt;
        delete f.error;
    }
    activity(idea, summary, source, seq) {
        idea.progress.activity = [...idea.progress.activity, { at: new Date().toISOString(), summary, source, ...(seq === undefined ? {} : { seq }) }].slice(-80);
        idea.updatedAt = new Date().toISOString();
        idea.revision++;
    }
}
/** 给执行 Agent 的一致约定：开始已包含必要跟进，结构化报告更新同一目标。 */
export function trackingInstruction(idea) {
    const template = GENERAL_IDEAS.find(x => x.id === idea.templateId);
    return `Idea ID：${idea.id}\n任务：${idea.instruction}\n完成口径：${idea.progress?.completionRule ?? template?.completionRule ?? idea.instruction}\n默认跟进：${template?.defaultFollowUp ?? "根据目标需要决定并直接安排；一次性工作不必额外建立周期任务。"}\n点击马上开始已授权描述范围内的必要步骤。复用已知信息，只集中询问缺失的关键资料；不要询问要不要帮忙、要不要创建定时任务。\n资料齐全后使用 ideas_update_progress 报告进度；需要跟进时 state=tracking，沿用已有偏好或默认频率，宿主会真实创建并核实排程，不要再调用 schedule_create 重复建立。日期相关目标须提供 followup_at 或 followup_until（含时区）。长期目标的阶段产出不算整体完成。\n可先用 state=inspect 读取本轮证据编号，再在交付后报告 state=completed 和 evidence_seqs；只有一次性构件交付且 present 产物实际存在才自动完成。同一回合多个目标的构件文件名须包含对应 Idea ID，以便单独核验。后续普通聊天继续或更新此目标时，先 inspect，再把本轮真实用户消息编号放进 evidence_seqs 即可关联；无需重复传 user_update_seq，不能把无关聊天归给目标。外部到账、预约或长期目标达成须读回证据，无法核实就报告等待。用户在关联聊天明确表示整体目标已经达成时，可用 completion_kind=user_update 并引用 user_update_seq 收尾；普通进展不能作为整体完成依据。进度回写只是辅助记录，最多修正一次；回写失败也必须给出清楚的正文回复和构件，不得反复空转或让用户重填已答信息。用户可在任务页明确确认完成。涉及具体付款、取消服务或对外发送时遵守已有授权要求。`;
}
function validDate(value) {
    if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)))
        throw new Error("请提供含时区的有效日期时间。");
    return new Date(value).toISOString();
}
function errorText(error) { return error instanceof Error ? error.message : String(error); }

import { isRecord } from "./types.js";
export class IdeasEngine {
    config;
    store;
    run;
    generating;
    now;
    state;
    loading;
    timer;
    stopped = true;
    disposed = false;
    checking = false;
    error = "";
    busy = new Set();
    turns = new Map();
    version = 0;
    constructor(config, store, run, generating, now = Date.now) {
        this.config = config;
        this.store = store;
        this.run = run;
        this.generating = generating;
        this.now = now;
    }
    /** 只在 Host 生命周期启动一次；本地检查不会自行触发前端 RPC 或执行 Agent。 */
    start() {
        if (this.disposed || !this.stopped || !this.config.autoEnabled)
            return;
        this.stopped = false;
        this.schedule(this.config.startupDelayMs);
    }
    dispose() {
        this.stopped = true;
        this.disposed = true;
        clearTimeout(this.timer);
        this.turns.clear();
        this.busy.clear();
    }
    schedule(delay) {
        this.timer = setTimeout(() => {
            void this.check().catch(error => { this.error = readable(error); }).finally(() => {
                if (!this.stopped)
                    this.schedule(this.config.checkIntervalMs);
            });
        }, delay);
        this.timer.unref();
    }
    load() {
        return this.loading ??= this.store.transaction(async () => {
            const saved = await this.store.readEngine();
            if (saved !== undefined && !validState(saved))
                throw new Error("Ideas 调度状态格式无效，请检查 _engine.md。");
            return this.state = saved ?? { version: 1, day: "", attempts: 0, lastAttempt: 0, lastSuccess: 0,
                nextAttempt: 0, failures: 0, dirty: true, context: [], lastError: "" };
        });
    }
    save() { return this.store.transaction(() => this.store.saveEngine(this.state)); }
    async snapshot() {
        const state = await this.load();
        return { enabled: this.config.autoEnabled, lastUpdatedAt: stamp(state.lastSuccess), nextAttemptAt: stamp(this.nextAttempt(state)),
            lastError: this.error || state.lastError, attemptsToday: state.day === this.day() ? state.attempts : 0 };
    }
    day() { return new Intl.DateTimeFormat("en-CA", { timeZone: this.config.timezone }).format(this.now()); }
    async context() { return (await this.load()).context.slice(); }
    /** 反馈或新对话只标记变化；真正调用仍由限频检查控制。 */
    async changed(messages) {
        this.version++;
        const state = await this.load();
        state.dirty = true;
        if (messages)
            state.context = [...state.context, ...messages].slice(-6).map(item => ({ ...item, text: item.text.slice(0, 600) }));
        await this.save();
    }
    async completed(version) {
        const state = await this.load();
        state.lastSuccess = this.now();
        // 手动更新和自动更新都以本次成功为起点，避免刚更新完又被后台立刻替换。
        state.nextAttempt = Math.max(state.nextAttempt, state.lastSuccess + this.config.autoIntervalMs);
        state.failures = 0;
        state.dirty = version !== this.version;
        this.error = "";
        state.lastError = "";
        await this.save();
    }
    /** 仅采集根会话正常完成的用户/助手文本，跳过工具、注入信息和失败回合。 */
    capture(session, event) {
        if (session.header?.origin === "subagent" || this.stopped)
            return;
        const id = session.id;
        const data = isRecord(event.data) ? event.data : {};
        if (event.type === "turn/start") {
            this.busy.add(id);
            return;
        }
        if (event.type === "user/message" || event.type === "assistant/message") {
            const message = event.type === "user/message" ? data : data.message;
            if (!isRecord(message) || (event.type === "user/message" && (!isRecord(message.source) || message.source.kind !== "user")))
                return;
            if (isRecord(message.source) && message.source.kind === "plugin")
                return;
            const text = typeof message.content === "string" ? message.content : Array.isArray(message.content)
                ? message.content.flatMap(part => isRecord(part) && part.type === "text" && typeof part.text === "string" ? [part.text] : []).join("\n") : "";
            if (text.trim()) {
                if (!this.turns.has(id) && this.turns.size >= 20)
                    this.turns.delete(this.turns.keys().next().value);
                const messages = this.turns.get(id) ?? [];
                messages.push({ role: event.type === "user/message" ? "user" : "assistant", text: text.trim().slice(0, 600) });
                this.turns.set(id, messages.slice(-6));
            }
        }
        if (event.type !== "turn/end")
            return;
        this.busy.delete(id);
        const messages = this.turns.get(id);
        this.turns.delete(id);
        if (isRecord(data.reason) && data.reason.kind === "completed" && messages?.some(item => item.role === "user"))
            void this.changed(messages).catch(error => { this.error = readable(error); });
    }
    forget(id) { this.busy.delete(id); this.turns.delete(id); }
    /** 配额在请求前落盘；失败指数退避，重启后继续遵守配额，旧卡片不删除。 */
    async check() {
        if (this.disposed || !this.config.autoEnabled || this.checking || this.generating() || this.busy.size)
            return;
        this.checking = true;
        try {
            const state = await this.load();
            const now = this.now();
            if (state.day !== this.day()) {
                state.day = this.day();
                state.attempts = 0;
            }
            if (now < this.nextAttempt(state) || state.attempts >= this.config.autoDailyLimit)
                return;
            const cards = await this.store.transaction(() => this.store.list());
            if (this.disposed || this.generating() || this.busy.size)
                return;
            if (!state.dirty && cards.some(idea => idea.source !== "general" && idea.status === "suggested" && !idea.archivedAt)
                && now - state.lastSuccess < this.config.refreshAfterMs)
                return;
            state.attempts++;
            state.lastAttempt = now;
            state.nextAttempt = now + this.config.autoIntervalMs;
            await this.save();
            try {
                await this.run();
            }
            catch (error) {
                state.failures++;
                state.nextAttempt = this.now() + Math.min(this.config.autoIntervalMs * 2 ** (state.failures - 1), 86400000);
                this.error = readable(error);
                state.lastError = this.error;
                await this.save();
            }
        }
        finally {
            this.checking = false;
        }
    }
    /** 配置变慢后立即按新间隔约束旧状态，重启和新对话均不能绕过十二小时窗口。 */
    nextAttempt(state) {
        return Math.max(state.nextAttempt, state.lastAttempt ? state.lastAttempt + this.config.autoIntervalMs : 0, state.lastSuccess ? state.lastSuccess + this.config.autoIntervalMs : 0);
    }
}
/** 旧卡片无需迁移；新增调度文件单独检查，损坏时停止生成而不是重置配额。 */
function validState(value) {
    return isRecord(value) && value.version === 1 && typeof value.day === "string" && typeof value.dirty === "boolean" && typeof value.lastError === "string"
        && ["attempts", "lastAttempt", "lastSuccess", "nextAttempt", "failures"].every(key => typeof value[key] === "number" && Number.isSafeInteger(value[key]) && Number(value[key]) >= 0)
        && Array.isArray(value.context) && value.context.length <= 6 && value.context.every(item => isRecord(item)
        && ["user", "assistant"].includes(String(item.role)) && typeof item.text === "string" && item.text.length <= 600);
}
function stamp(time) { return time ? new Date(time).toISOString() : ""; }
function readable(error) { return error instanceof Error ? error.message : "后台推荐失败。"; }

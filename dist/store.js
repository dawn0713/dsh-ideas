/** 每条推荐保存成独立 Markdown；单进程串行更新及原子替换防止并发覆盖。 */
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile, lstat } from "node:fs/promises";
import { join } from "node:path";
import { isIdea } from "./types.js";
export class IdeaStore {
    directory;
    queue = Promise.resolve();
    constructor(directory) {
        this.directory = directory;
    }
    /** 写入失败不阻断后续操作；所有读写通过同一队列获取一致的文件状态。 */
    transaction(operation) {
        const result = this.queue.then(operation);
        this.queue = result.catch(() => undefined);
        return result;
    }
    async list() {
        await mkdir(this.directory, { recursive: true, mode: 0o700 });
        const names = (await readdir(this.directory)).filter(name => /^[a-f\d-]{36}\.md$/.test(name));
        const items = await Promise.all(names.map(name => this.read(name.slice(0, -3))));
        return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    async read(id) {
        const file = this.path(id);
        if ((await lstat(file)).isSymbolicLink())
            throw new Error("Ideas 文件不能是符号链接。");
        const text = await readFile(file, "utf8");
        const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
        const value = match ? JSON.parse(match[1]) : undefined;
        if (!isIdea(value) || value.id !== id)
            throw new Error(`Ideas 文件格式无效：${id}.md`);
        return value;
    }
    async save(idea) {
        if (!isIdea(idea))
            throw new Error("Idea 数据格式无效。");
        await mkdir(this.directory, { recursive: true, mode: 0o700 });
        // JSON 是合法的 YAML 子集，元数据用前言存储；下方正文便于直接阅读和归档。
        const body = `---\n${JSON.stringify(idea, null, 2)}\n---\n\n# ${idea.title}\n\n${idea.description}\n\n## 推荐理由\n\n${idea.reason}\n\n## 关联目标\n\n${idea.goal || "未标注"}\n\n## 执行指令\n\n${idea.instruction}\n\n## ${idea.source === "general" ? "通用点子来源" : idea.basis === "goal" ? "目标步骤依据" : "记忆依据"}\n\n${idea.source === "general" ? idea.reason : idea.evidence.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}\n\n## 用户反馈\n\n${(idea.feedback ?? []).map(item => `- ${item.at} · ${item.kind}：${item.note}`).join("\n")}\n\n## 状态记录\n\n${idea.history.map(h => `- ${h.at} · ${h.action}${h.note ? `：${h.note}` : ""}`).join("\n")}\n`;
        const temporary = join(this.directory, `.${idea.id}-${randomUUID()}.tmp`);
        await writeFile(temporary, body, { mode: 0o600, flag: "wx" });
        await rename(temporary, this.path(idea.id));
    }
    /** 持久化版本号用于拒绝另一页面基于旧数据发出的修改。 */
    checkRevision(idea, revision) {
        if (idea.revision !== revision)
            throw new Error("此 Idea 已更新，请刷新后重试。");
    }
    /** 调度状态也使用 Markdown 前言保存；文件缺失表示第一次启动，不覆盖损坏的已有文件。 */
    async readEngine() {
        const file = join(this.directory, "_engine.md");
        try {
            if ((await lstat(file)).isSymbolicLink())
                throw new Error("调度状态不能是符号链接。");
            const text = await readFile(file, "utf8");
            const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
            if (!match)
                throw new Error("Ideas 调度状态格式无效。");
            return JSON.parse(match[1]);
        }
        catch (error) {
            if (error.code === "ENOENT")
                return undefined;
            throw error;
        }
    }
    /** 与推荐共用写入队列，原子保存配额与上下文，防止重启绕过调用间隔。 */
    async saveEngine(state) {
        await mkdir(this.directory, { recursive: true, mode: 0o700 });
        const file = join(this.directory, `._engine-${randomUUID()}.tmp`);
        await writeFile(file, `---\n${JSON.stringify(state, null, 2)}\n---\n\n# Ideas 后台状态\n\n记录自动生成限频、更新时间和近期对话上下文。\n`, { mode: 0o600, flag: "wx" });
        await rename(file, join(this.directory, "_engine.md"));
    }
    path(id) {
        if (!/^[a-f\d-]{36}$/.test(id))
            throw new Error("Idea ID 无效。");
        return join(this.directory, `${id}.md`);
    }
}
/** 统一初始化推荐和时间信息，避免模型提供的 ID 或状态控制本地文件。 */
export function createIdea(draft, context, evidence) {
    const at = new Date().toISOString();
    return { ...draft, ...context, id: randomUUID(), status: "suggested", revision: 1, createdAt: at,
        updatedAt: at, evidence: draft.evidenceIds.map(id => evidence[id - 1]), history: [{ at, action: "generated" }] };
}

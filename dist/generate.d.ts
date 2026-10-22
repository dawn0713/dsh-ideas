/** 检索现有 ReMe，并将记忆与目标事实交给 DSH 已有模型路由生成推荐。 */
import { type IdeaDraft } from "./types.js";
import type { IdeasConfig } from "./config.js";
export declare const DEFAULT_QUERY = "\u7528\u6237\u8FD1\u671F\u76EE\u6807\u3001\u6B63\u5728\u63A8\u8FDB\u7684\u9879\u76EE\u3001\u672A\u5B8C\u6210\u4E8B\u9879\u3001\u53CD\u590D\u51FA\u73B0\u7684\u56F0\u96BE\u4EE5\u53CA\u5DE5\u4F5C\u504F\u597D";
export declare const SYSTEM_PROMPT: string;
/** 将搜索结果保持为有边界的事实材料，避免把 metadata 中的任意对象当指令拼接。 */
export declare function memoryEvidence(answer: unknown, maximum: number): string[];
export declare function searchMemory(config: IdeasConfig, query: string, signal: AbortSignal): Promise<string[]>;
/** 模型输出严格校验；拒绝缺少证据、字段不全及超量推荐，错误不写入磁盘。 */
export declare function parseIdeas(text: string, evidenceCount: number, count: number): IdeaDraft[];
/** 去掉大小写和空白差异，用于防止简单的同名重复推荐。 */
export declare function titleKey(title: string): string;

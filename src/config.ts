/** 配置仅包含端点、模型路由及工作目录，不接收或向浏览器暴露 API Key。 */
import z from "@deepseek-ai/schemastery";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";

export const Config = z.object({
  memoryBackend: z.union([z.const("reme"), z.const("meow")]).default("reme"),
  remeEndpoint: z.string().default("http://127.0.0.1:3457"),
  dataDir: z.string().default(join(homedir(), ".dsh", "ideas")),
  provider: z.string(),
  model: z.string(),
  count: z.number().default(3),
  searchLimit: z.number().default(8),
  searchTimeoutMs: z.number().default(30000),
  generationTimeoutMs: z.number().default(300000),
  maxMemoryChars: z.number().default(18000),
  maxOutputTokens: z.number().default(8192),
  timezone: z.string().default("Asia/Shanghai"),
  autoEnabled: z.boolean().default(true),
  startupDelayMs: z.number().default(60000),
  checkIntervalMs: z.number().default(60000),
  refreshAfterMs: z.number().default(43200000),
  autoIntervalMs: z.number().default(43200000),
  autoDailyLimit: z.number().default(6),
});
export interface IdeasConfig {
  memoryBackend: "reme" | "meow"; remeEndpoint: string; dataDir: string; provider?: string; model?: string;
  count: number; searchLimit: number; searchTimeoutMs: number;
  generationTimeoutMs: number; maxMemoryChars: number; maxOutputTokens: number; timezone: string;
  autoEnabled: boolean; startupDelayMs: number; checkIntervalMs: number;
  refreshAfterMs: number; autoIntervalMs: number; autoDailyLimit: number;
}
/** 插件可直接通过 Context 加载，因此不依赖配置加载器一定预填默认值。 */
export function resolveConfig(input: Partial<IdeasConfig> = {}): IdeasConfig {
  const config: IdeasConfig = { memoryBackend: "reme", remeEndpoint: "http://127.0.0.1:3457", dataDir: join(homedir(), ".dsh", "ideas"),
    count: 3, searchLimit: 8, searchTimeoutMs: 30000, generationTimeoutMs: 300000,
    maxMemoryChars: 18000, maxOutputTokens: 8192, timezone: "Asia/Shanghai",
    autoEnabled: true, startupDelayMs: 60000, checkIntervalMs: 60000,
    refreshAfterMs: 43200000, autoIntervalMs: 43200000, autoDailyLimit: 6, ...input };
  if (!["reme", "meow"].includes(config.memoryBackend)) throw new Error("memoryBackend 仅支持 reme 或 meow。");
  const url = new URL(config.remeEndpoint);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash)
    throw new Error("ReMe 地址必须是无凭据的 HTTP(S) 地址。");
  config.remeEndpoint = config.remeEndpoint.replace(/\/+$/, "");
  if (!isAbsolute(config.dataDir)) throw new Error("dataDir 必须是绝对路径。");
  if (Boolean(config.provider) !== Boolean(config.model)) throw new Error("provider 与 model 必须同时填写或同时省略。");
  for (const [key, min, max] of [["count", 1, 8], ["searchLimit", 1, 50], ["searchTimeoutMs", 1000, 120000],
    ["generationTimeoutMs", 1000, 600000], ["maxMemoryChars", 1000, 60000], ["maxOutputTokens", 512, 16000],
    ["startupDelayMs", 1000, 3600000], ["checkIntervalMs", 1000, 3600000], ["refreshAfterMs", 60000, 604800000],
    ["autoIntervalMs", 60000, 604800000], ["autoDailyLimit", 1, 24]] as const) {
    if (!Number.isInteger(config[key]) || config[key] < min || config[key] > max) throw new Error(`${key} 必须在 ${min}～${max} 之间。`);
  }
  if (typeof config.autoEnabled !== "boolean") throw new Error("autoEnabled 必须是布尔值。");
  new Intl.DateTimeFormat("zh-CN", { timeZone: config.timezone });
  return config;
}

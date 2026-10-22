/** 配置仅包含端点、模型路由及工作目录，不接收或向浏览器暴露 API Key。 */
import z from "@deepseek-ai/schemastery";
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    memoryBackend: z<"reme" | "meow", "reme" | "meow", "defined">;
    remeEndpoint: z<string, string, "defined">;
    dataDir: z<string, string, "defined">;
    provider: z<string, string, "plain">;
    model: z<string, string, "plain">;
    count: z<number, number, "defined">;
    searchLimit: z<number, number, "defined">;
    searchTimeoutMs: z<number, number, "defined">;
    generationTimeoutMs: z<number, number, "defined">;
    maxMemoryChars: z<number, number, "defined">;
    maxOutputTokens: z<number, number, "defined">;
    timezone: z<string, string, "defined">;
    autoEnabled: z<boolean, boolean, "defined">;
    startupDelayMs: z<number, number, "defined">;
    checkIntervalMs: z<number, number, "defined">;
    refreshAfterMs: z<number, number, "defined">;
    autoIntervalMs: z<number, number, "defined">;
    autoDailyLimit: z<number, number, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    memoryBackend: z<"reme" | "meow", "reme" | "meow", "defined">;
    remeEndpoint: z<string, string, "defined">;
    dataDir: z<string, string, "defined">;
    provider: z<string, string, "plain">;
    model: z<string, string, "plain">;
    count: z<number, number, "defined">;
    searchLimit: z<number, number, "defined">;
    searchTimeoutMs: z<number, number, "defined">;
    generationTimeoutMs: z<number, number, "defined">;
    maxMemoryChars: z<number, number, "defined">;
    maxOutputTokens: z<number, number, "defined">;
    timezone: z<string, string, "defined">;
    autoEnabled: z<boolean, boolean, "defined">;
    startupDelayMs: z<number, number, "defined">;
    checkIntervalMs: z<number, number, "defined">;
    refreshAfterMs: z<number, number, "defined">;
    autoIntervalMs: z<number, number, "defined">;
    autoDailyLimit: z<number, number, "defined">;
}>>, "plain">;
export interface IdeasConfig {
    memoryBackend: "reme" | "meow";
    remeEndpoint: string;
    dataDir: string;
    provider?: string;
    model?: string;
    count: number;
    searchLimit: number;
    searchTimeoutMs: number;
    generationTimeoutMs: number;
    maxMemoryChars: number;
    maxOutputTokens: number;
    timezone: string;
    autoEnabled: boolean;
    startupDelayMs: number;
    checkIntervalMs: number;
    refreshAfterMs: number;
    autoIntervalMs: number;
    autoDailyLimit: number;
}
/** 插件可直接通过 Context 加载，因此不依赖配置加载器一定预填默认值。 */
export declare function resolveConfig(input?: Partial<IdeasConfig>): IdeasConfig;

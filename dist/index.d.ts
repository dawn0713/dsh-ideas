/** DSH 0.2.1-alpha.2 Host 插件：复用模型服务和原生会话 prompt 接口。 */
import type { Context } from "@deepseek-ai/cordis";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { type IdeasConfig } from "./config.js";
import { IdeasRuntime } from "./runtime.js";
export { Config } from "./config.js";
export declare const name = "personal-ideas";
export declare const inject: string[];
declare module "@deepseek-ai/cordis" {
    interface Context {
        ideasRuntime: IdeasRuntime;
    }
    interface Events {
        "personalGoals/changed"(): void;
    }
}
declare module "@deepseek-ai/dsh-typert-protocol" {
    interface RemoteErrorDetailsMap {
        "ideas/operation-failed": {};
    }
}
export declare function apply(ctx: Context, input?: Partial<IdeasConfig>): void;
/** 通过 DSH 自带的认证与 Typert 通道提供业务接口，无需额外开放 HTTP 端口。 */
export declare class IdeasGateway extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    list(): Promise<import("./runtime.js").IdeasSnapshot>;
    generate(request: unknown, signal: AbortSignal): Promise<import("./runtime.js").IdeasSnapshot>;
    update(request: unknown): Promise<import("./runtime.js").IdeasSnapshot>;
    start(request: unknown, signal: AbortSignal): Promise<import("./runtime.js").IdeasSnapshot>;
    startGeneral(request: unknown, signal: AbortSignal): Promise<import("./runtime.js").IdeasSnapshot>;
    followup(request: unknown, signal: AbortSignal): Promise<import("./runtime.js").IdeasSnapshot>;
}

/** 使用 DSH 正式 slot 扩展点贡献全页、左侧入口和右侧页签。 */
import type { Context } from "@deepseek-ai/cordis";
import { zh } from "./locales.js";
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface LocaleNamespaceMap {
        "personalIdeas": keyof typeof zh;
    }
}
export declare const inject: string[];
export declare function apply(ctx: Context): void;

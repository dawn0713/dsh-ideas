import type { Idea } from "../types.js";
import type { IdeasApi } from "./api.js";
import type { Translate } from "./locales.js";
/** 在概览和详情展示真实同步结果；失败重试不重复执行已完成的任务。 */
export declare function GoalSyncStatus({ idea, api, t }: {
    idea: Idea;
    api: IdeasApi;
    t: Translate;
}): import("react").JSX.Element | null;
export declare function ProgressPanel({ idea, api, t }: {
    idea: Idea;
    api: IdeasApi;
    t: Translate;
}): import("react").JSX.Element | null;
/** 概览和详情使用相同状态口径，旧版交接记录不会显示成执行成功。 */
export declare function progressLabel(idea: Idea, t: Translate): string;

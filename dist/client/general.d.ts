/** 通用目录直接展示，不依赖记忆或模型；浏览详情不会保存偏好或启动任务。 */
import { type GeneralIdea } from "../catalog.js";
import type { IdeasApi } from "./api.js";
import type { Translate } from "./locales.js";
export declare function GeneralCatalog({ t, onSelect }: {
    t: Translate;
    onSelect(id: string): void;
}): import("react").JSX.Element;
/** 明确点击开始后才经宿主目录创建任务，再使用既有的主聊天交接流程。 */
export declare function GeneralDetail({ item, api, t, sessionId, onClose }: {
    item: GeneralIdea;
    api: IdeasApi;
    t: Translate;
    sessionId?: string;
    onClose(): void;
}): import("react").JSX.Element;

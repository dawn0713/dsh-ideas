import type { IdeasApi } from "./api.js";
import type { Translate } from "./locales.js";
export interface PanelProps {
    api: IdeasApi;
    t: Translate;
    sessionId?: string;
    sessionLabel?: string;
    compact?: boolean;
    onOpen?: () => void;
    onBack?: () => void;
}
export declare function IdeasPanel({ api, t, sessionId, sessionLabel, compact, onOpen, onBack }: PanelProps): import("react").JSX.Element;
/** 内联 SVG 是代码原生图标，不额外加载位图或第三方图标库。 */
export declare function Bulb({ size }: {
    size?: number;
}): import("react").JSX.Element;

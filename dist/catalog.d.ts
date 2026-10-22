/** 中国场景的固定通用目录；每项声明交付、完成口径和默认跟进，浏览时不启动任务。 */
export interface GeneralIdea {
    id: string;
    category: string;
    icon: string;
    title: string;
    description: string;
    needs: string[];
    deliverable: string;
    instruction: string;
    includes: {
        title: string;
        description: string;
        kind: string;
    }[];
    howItWorks: string;
    mode: "once" | "ongoing" | "mixed";
    completionRule: string;
    defaultFollowUp: string;
    defaultCron?: string;
    executionPolicy: string;
}
export declare const GENERAL_CATEGORIES: readonly ["健康与健身", "财务管理", "效率提升", "更多点子"];
export declare const GENERAL_IDEAS: readonly GeneralIdea[];

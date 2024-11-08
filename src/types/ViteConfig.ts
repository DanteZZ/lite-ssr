import type { Head } from "@unhead/schema";

export type HeadConfig = Head;

export interface lssrViteConfig {
    entry?: string
    head?: HeadConfig;
}


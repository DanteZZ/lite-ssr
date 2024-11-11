import type { Head } from "@unhead/schema";

export type HeadConfig = Head;

export interface LssrConfig {
    entry?: string
    head?: HeadConfig
    html?: string
}


import type { Head } from "@unhead/schema";

export type HeadConfig = Head;

export interface LssrConfig {
    dist?: string,
    entry?: string
    head?: HeadConfig
    html?: string
    port?: number
}


import { Head } from "@unhead/vue";

export interface lssrViteConfig {
    entry?: string
    head?: Head
}

export function lssrVite(options: lssrViteConfig = { entry: "/src/main.ts" }) {
    return {
        name: 'lssr-vite',
        config(config: any) {
            config.lssr = options;
        }
    };
}

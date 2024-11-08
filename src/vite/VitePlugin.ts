import { lssrViteConfig } from "../types/ViteConfig.js";

export function VitePlugin(options: lssrViteConfig = { entry: "/src/main.ts" }) {
    return {
        name: 'lssr-vite',
        config(config: any) {
            config.lssr = options;
        }
    };
}

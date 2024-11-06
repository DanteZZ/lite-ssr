export interface lssrViteConfig {
    entry?: string
}

export function lssrVite(options: lssrViteConfig = { entry: "/src/main.ts" }) {
    return {
        name: 'lssr-vite',
        config(config: any) {
            config.lssr = options;
        }
    };
}

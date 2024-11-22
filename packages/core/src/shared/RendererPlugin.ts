import type { Plugin } from "./PluginSystem.js";

export function defineRendererPlugin<Context, Config>(
    name: string,
    initialize: (context: Context, config: Config) => void | Promise<void>
) {
    return (config: Config): Plugin => {
        return {
            name,
            initialize,
            config,
        };
    };
}
import { Plugin } from "@lite-ssr/core/shared";
import { Server } from "../common/Server.js";

export function definePlugin<Config>(
    name: string,
    initialize: (context: Server, config: Config) => void | Promise<void>
) {
    return (config: Config): Plugin => {
        return {
            name,
            initialize,
            config,
        };
    };
}
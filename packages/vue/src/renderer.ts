import { VueRenderer } from "./common/VueRenderer.js";
export type { Plugin } from "@lite-ssr/core/shared";
declare module '@lite-ssr/core' {
    interface LssrConfig {
        hydration?: boolean
    }
}

const { definePlugin } = VueRenderer;
export {
    VueRenderer,
    definePlugin
}
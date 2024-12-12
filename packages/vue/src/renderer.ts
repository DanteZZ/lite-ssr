import { VueRenderer } from "./common/VueRenderer.js";

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
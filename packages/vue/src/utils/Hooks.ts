
import { LssrConfig } from "@lite-ssr/core";
import { HookSystem } from "@lite-ssr/core/shared";
import type { App } from "vue";
import type { VueRenderer } from "./VueRenderer.js";

interface RendererHook {
    $app: App
    $renderer: VueRenderer,
    $entry: string,
    $config: LssrConfig
    url: string
}

interface RendererHookTypes {
    'beforeProvideContext': RendererHook;
    'init': RendererHook;
    'beforeRender': RendererHook;
    'beforeFillHtml': RendererHook;
    'fillHtml': RendererHook;
}

const serverHookSystem = new HookSystem();


export function defineHook<K extends keyof RendererHookTypes>(
    hookName: K,
    handler: (params: RendererHookTypes[K]) => void | Promise<void>
) {
    serverHookSystem.defineHook(hookName, handler);
}

export async function dispatchHook<K extends keyof RendererHookTypes>(
    hookName: K,
    params: RendererHookTypes[K]
) {
    await serverHookSystem.dispatchHook(hookName, params);
}
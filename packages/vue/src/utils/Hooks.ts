import { LssrConfig } from "@lite-ssr/core";
import { HookSystem } from "@lite-ssr/core/shared";
import type { App } from "vue";
import type { VueRenderer } from "../common/VueRenderer.js";
import { Request } from "express";

/**
 * Interface defining the context passed to hooks during the rendering process.
 */
interface RendererHook {
    $app: App; // The Vue application instance
    $renderer: VueRenderer; // The SSR renderer instance for Vue
    $entry: string; // The entry point file name
    $config: LssrConfig; // The Lite-SSR configuration object
    $req: Request;
    url: string; // The current URL being rendered
    initialState: Record<string, any>
}

/**
 * Type mapping for available hooks and their associated parameter structures.
 *
 * Each key corresponds to a hook name, and its value defines the structure of the parameters
 * passed to the hook when it is triggered.
 */
interface RendererHookTypes {
    'beforeProvideContext': RendererHook; // Hook triggered before providing the context
    'init': RendererHook; // Hook triggered during initialization
    'beforeRender': RendererHook; // Hook triggered before rendering begins
    'beforeFillHtml': RendererHook; // Hook triggered before HTML is populated with data
    'fillHtml': RendererHook; // Hook triggered when the final HTML is being populated,
    'fillInitialState': RendererHook; // Hook triggered during initialState initialization
}

/**
 * The server-side hook system instance for managing and dispatching hooks.
 *
 * Hooks allow extending and customizing the SSR lifecycle by attaching user-defined behavior.
 */
const serverHookSystem = new HookSystem();

/**
 * Defines a new hook handler for a specified hook name.
 *
 * Hook handlers allow developers to inject custom logic at specific stages of the rendering lifecycle.
 *
 * @param hookName - The name of the hook to define (e.g., 'beforeRender').
 * @param handler - A function to handle the hook, which receives the hook's parameters.
 *                  Can be synchronous or return a promise for asynchronous operations.
 */
export function defineHook<K extends keyof RendererHookTypes>(
    hookName: K,
    handler: (params: RendererHookTypes[K]) => void | Promise<void>
) {
    serverHookSystem.defineHook(hookName, handler);
}

/**
 * Dispatches a hook, triggering all handlers registered for the specified hook name.
 *
 * This executes all user-defined handlers in the order they were registered, passing the same
 * parameter object to each handler.
 *
 * @param hookName - The name of the hook to dispatch (e.g., 'beforeRender').
 * @param params - The parameters to pass to the hook's handlers.
 * @returns A promise that resolves when all handlers have been executed.
 */
export async function dispatchHook<K extends keyof RendererHookTypes>(
    hookName: K,
    params: RendererHookTypes[K]
) {
    await serverHookSystem.dispatchHook(hookName, params);
}

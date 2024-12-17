import { renderToString } from 'vue/server-renderer';
import { App } from 'vue';
import { Renderer } from '@lite-ssr/core';
import { simplifyPrefetchedStores } from '../utils/PrefetchStoreConverter.js';
import { defineHook, dispatchHook } from '../utils/Hooks.js';
import { defineRendererPlugin } from '@lite-ssr/core/shared';
import type { Request, Response } from 'express';

/**
 * VueRenderer class is responsible for rendering Vue applications in an SSR context.
 */
export class VueRenderer extends Renderer {
    private context = { modules: [] as string[] }; // Holds the context, including dynamically loaded modules.
    private contextStores = {} as Record<string, unknown>; // Stores the preloaded state data for the app.
    public app?: App; // The Vue application instance.
    public appPayload: Record<string, any> = {};
    public defineHook = defineHook; // Utility to define hooks for SSR.

    /**
     * Creates the hook data object for use in lifecycle hooks.
     *
     * @param url - The URL being rendered.
     * @returns The hook data object.
     */
    protected hookData(url: string, initialState: Record<string, any> = {}) {
        return {
            $app: this.app!,
            $renderer: this as VueRenderer,
            $config: this.config,
            $entry: this.entryPoint,
            $req: this.getReq() as Request,
            $res: this.getRes() as Response,
            url,
            initialState
        };
    }

    /**
     * Defines a plugin for the VueRenderer.
     *
     * @param args - Arguments for defining the plugin.
     * @returns The defined plugin.
     */
    static definePlugin<Config>(...args: Parameters<typeof defineRendererPlugin<VueRenderer, Config>>) {
        return defineRendererPlugin<VueRenderer, Config>(...args);
    }

    /**
     * Handles errors in Vue components during SSR.
     *
     * @param err - The error that occurred.
     * @param instance - The Vue component instance where the error occurred.
     * @param info - Additional information about the error.
     */
    errorHandler(err: unknown, instance: any, info: string) {
        console.error('Vue Error:', {
            error: err,
            instance,
            info,
        });

        if (err instanceof Error) {
            console.error(`An error occurred: ${err.message}`);
            console.error(err.stack);
        } else {
            console.error('An unknown error occurred.');
        }
    }

    /**
     * Renders the Vue application to an HTML string.
     *
     * @param url - The URL being rendered.
     * @returns A promise that resolves to the rendered HTML string.
     */
    async renderApp(url: string): Promise<string> {
        // Reset context and contextStores for a fresh render.
        this.appPayload = {};
        this.context = { modules: [] };
        this.contextStores = {};

        const cookies = Object.fromEntries(Object.entries(this.getReq().cookies).map(([key, val]) => [key, { value: val, options: {} }]));

        const hydration = 'hydration' in this.config ? this.config.hydration : true;

        await dispatchHook('beforeLoadApp', this.hookData(url));

        // Dynamically load the application entry point.
        const { default: importedApp } = await this.load(
            /* @vite-ignore */
            `${this.entryPoint}?${Date.now()}`
        ) as { default: App | Function };

        // Determine if the imported app is a function or an App instance.
        if (importedApp instanceof Function && importedApp.constructor.name === "AsyncFunction") {
            this.app = await importedApp(this.appPayload);
        } else if (importedApp instanceof Function) {
            this.app = importedApp(this.appPayload);
        } else {
            this.app = importedApp;
        }

        // Set the error handler for the app.
        this.app!.config.errorHandler = this.errorHandler;

        // Dispatch hooks for context provisioning and app initialization.
        await dispatchHook('beforeProvideContext', this.hookData(url));
        this.app!.provide('context', this.context);
        this.app!.provide('contextStores', this.contextStores);

        this.app!.provide('__cookies', cookies);
        await dispatchHook('init', this.hookData(url));

        // Check if vue-router is used, and prepare the router for the given URL.
        const router = this.app!._context.config?.globalProperties?.$router || null;

        if (router) {
            await router.push(url);
            await router.isReady();
        }

        // Dispatch the beforeRender hook and render the app to a string.
        await dispatchHook('beforeRender', this.hookData(url));
        const appHtml = await renderToString(this.app!);

        // Actualize cookies
        Object.entries(cookies).forEach(([name, { value, options }]) => {
            if (Object.keys(options).length || this.getReq().cookies[name] !== value) {
                this.getRes().cookie(name, value, options);
            }
        });

        return `<div id="app" ${!hydration ? 'non-h' : ''}>${appHtml}</div>`;
    }

    /**
     * Retrieves the initial state of the app for client-side hydration.
     *
     * @returns The initial state containing context and prefetched store data.
     */
    getInitialState() {
        const state = {
            states: this.context,
            stores: simplifyPrefetchedStores(this.contextStores),
            _pl: this.appPayload
        };
        dispatchHook('fillInitialState', this.hookData("", state));
        return state;
    }

    /**
     * Generates the final HTML for the application.
     *
     * @param url - The URL being rendered.
     * @param template - The base HTML template.
     * @returns A promise that resolves to the filled HTML.
     */
    async generateHtml(url: string, template: string) {
        this.html = template;

        // Dispatch hooks to allow modifications to the HTML.
        await dispatchHook('beforeFillHtml', this.hookData(url));
        await super.generateHtml(url, this.html);
        await dispatchHook('fillHtml', this.hookData(url));

        return this.html;
    }
}

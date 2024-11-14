import { renderToString } from 'vue/server-renderer';
import { renderSSRHead, SSRHeadPayload } from '@unhead/ssr';
import { Renderer } from '../../common/Renderer.js';
import { App } from 'vue';
import { Unhead } from '@unhead/vue';

export class VueRenderer extends Renderer {

    private context = { modules: [] as string[] };
    private contextStores = {} as Record<string, unknown>;
    private head: null | Unhead = null;

    async renderApp(url: string): Promise<string> {
        const { default: importedApp } = await import(
            /* @vite-ignore */
            `${this.entryPoint}?${Date.now()}`
        ) as { default: App | Function };

        let app: App;

        if (importedApp instanceof Function && importedApp.constructor.name === "AsyncFunction") {
            app = await importedApp();
        } else if (importedApp instanceof Function) {
            app = importedApp();
        } else {
            app = importedApp;
        }

        app.provide('context', this.context);
        app.provide('contextStores', this.contextStores);

        // Проверка на использование vue-router

        const router = app._context.config?.globalProperties?.$router || null;
        this.head = app._context.config?.globalProperties?.$head || null;

        if (router) {
            await router.push(url);
            await router.isReady();
        }

        if (this.head && this.headConfig) {
            this.head.push(this.headConfig);
        }

        return await renderToString(app);
    }

    async renderHead(): Promise<SSRHeadPayload> {
        if (this.head) {
            const head = await renderSSRHead(this.head);
            return head;
        }
        return { headTags: "", bodyTags: "", bodyTagsOpen: "", htmlAttrs: "", bodyAttrs: "" };
    }

    getContext() {
        return {
            context: this.context,
            contextStores: this.contextStores
        };
    }
}
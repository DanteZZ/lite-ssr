import { renderToString } from 'vue/server-renderer';
import { createHead } from '@unhead/vue';
import { renderSSRHead, SSRHeadPayload } from '@unhead/ssr';
import { Renderer } from '../../common/Renderer.js';
import { App } from 'vue';

export class VueRenderer extends Renderer {

    private context = { modules: [] as string[] };
    private contextStores = {} as Record<string, unknown>;
    private head = createHead();

    async renderApp(url: string): Promise<string> {
        const { default: app } = await import(
            /* @vite-ignore */
            `${this.entryPoint}?${Date.now()}`
        ) as { default: App };

        if (this.headConfig) { this.head.push(this.headConfig); }

        app.provide('context', this.context);
        app.provide('contextStores', this.contextStores);
        app.use(this.head);

        // Проверка на использование vue-router
        const router = app._context.config?.globalProperties?.$router || null;
        if (router) {
            router.push(url)
            await router.isReady();
        };

        return await renderToString(app);
    }

    async renderHead(): Promise<SSRHeadPayload> {
        const head = await renderSSRHead(this.head);
        return head;
    }

    getContext() {
        return {
            context: this.context,
            contextStores: this.contextStores
        };
    }
}
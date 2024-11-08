import { renderToString } from 'vue/server-renderer';
import { createHead } from '@unhead/vue';
import { renderSSRHead, SSRHeadPayload } from '@unhead/ssr';
import { Renderer } from '../../common/Renderer.js';
import { App } from 'vue';
// import { Manifest } from '../../common/ManifestUtils.js';

export class VueRenderer extends Renderer {

    private context = { modules: [] as string[] };
    private contextStores = {} as Record<string, unknown>;

    async renderApp(): Promise<string> {
        const { default: app } = await import(
            /* @vite-ignore */
            `${this.entryPoint}?${Date.now()}`
        ) as { default: App };

        const unhead = createHead();
        if (this.headConfig) { unhead.push(this.headConfig); }

        app.provide('context', this.context);
        app.provide('contextStores', this.contextStores);
        app.use(unhead);

        return await renderToString(app);
    }

    async renderHead(): Promise<SSRHeadPayload> {
        const head = await renderSSRHead(createHead());
        return head;
    }

    renderPreloadLinks(modules: string[]): string {
        // Логика прелоадов для Vue
        return '';
    }

    getContext() {
        return {
            context: this.context,
            contextStores: this.contextStores
        };
    }
}
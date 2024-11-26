import { renderToString } from 'vue/server-renderer';
import { App } from 'vue';
import { Renderer } from '@lite-ssr/core';
import { simplifyPrefetchedStores } from './PrefetchStoreConverter.js';

import { defineHook, dispatchHook } from './Hooks.js';
import { defineRendererPlugin } from '@lite-ssr/core/shared';

export class VueRenderer extends Renderer {
    private context = { modules: [] as string[] };
    private contextStores = {} as Record<string, unknown>;
    public app?: App;
    public defineHook = defineHook

    protected hookData(url: string) {
        return {
            $app: this.app!,
            $renderer: this as VueRenderer,
            $config: this.config,
            $entry: this.entryPoint,
            url,
        }
    }

    static definePlugin<Config>(...args: Parameters<typeof defineRendererPlugin<VueRenderer, Config>>) {
        return defineRendererPlugin<VueRenderer, Config>(...args)
    }

    errorHandler(err: unknown, instance: any, info: string) {
        console.error('Vue Error:', {
            error: err,
            instance,
            info,
        });

        // TODO: Сделать нормальный вывод ошибок
        if (err instanceof Error) {
            console.error(`Произошла ошибка: ${err.message}`);
            console.error(err.stack);
        } else {
            console.error('Произошла неизвестная ошибка');
        }
    }

    async renderApp(url: string): Promise<string> {
        const { default: importedApp } = await this.load(
            /* @vite-ignore */
            `${this.entryPoint}?${Date.now()}`
        ) as { default: App | Function };

        if (importedApp instanceof Function && importedApp.constructor.name === "AsyncFunction") {
            this.app = await importedApp();
        } else if (importedApp instanceof Function) {
            this.app = importedApp();
        } else {
            this.app = importedApp;
        }

        this.app!.config.errorHandler = this.errorHandler;

        dispatchHook('beforeProvideContext', this.hookData(url))
        this.app!.provide('context', this.context);
        this.app!.provide('contextStores', this.contextStores);

        // Проверка на использование vue-router

        dispatchHook('init', this.hookData(url))

        const router = this.app!._context.config?.globalProperties?.$router || null;

        if (router) {
            await router.push(url);
            await router.isReady();
        }

        dispatchHook('beforeRender', this.hookData(url))
        return `<div id="app">${await renderToString(this.app!)}</div>`;
    }


    getInitialState() {
        return {
            states: this.context,
            stores: simplifyPrefetchedStores(this.contextStores)
        };
    }

    async generateHtml(url: string, template: string) {
        this.html = template;
        await dispatchHook('beforeFillHtml', this.hookData(url));
        await super.generateHtml(url, this.html);
        await dispatchHook('fillHtml', this.hookData(url));
        return this.html;
    }
}
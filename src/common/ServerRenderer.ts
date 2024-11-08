import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer, ViteDevServer } from 'vite';
import { type lssrViteConfig } from '../types/ViteConfig.js';
import { RendererFactory } from './RenderFactory.js';
import { SSRHeadPayload } from '@unhead/ssr';
import { FinalContext } from '../types/Context.js';
import { simplifyPrefetchedStores } from '../frameworks/vue/utils/PrefetchStoreConverter.js';
import { serializeObject } from '../utils/Serialize.js';
import { showDevServerMessage } from '../utils/Console.js';
import { Framework } from '../types/Framework.js';
import { readFile } from 'fs/promises';

type customizedConfig = {
    lssr: lssrViteConfig
}

export class ServerRenderer {

    private framework: Framework;
    private app: express.Express;
    private vite?: ViteDevServer;
    private config?: lssrViteConfig;
    private entryPoint: string = "/src/main.ts"
    private htmlTemplate: string = ""

    constructor(framework: Framework) {
        this.app = express();
        this.framework = framework;
    }

    async initialize() {
        this.vite = await createServer({
            root: process.cwd(),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        this.config = (this.vite.config as unknown as customizedConfig)?.lssr || {}
        this.entryPoint = this.config?.entry || this.entryPoint;
        this.htmlTemplate = await readFile(this.config?.html || this.resolve("../../index.html"), "utf-8");
    }


    // Метод для рендеринга страницы
    async renderPage(req: express.Request, res: express.Response) {

        // Объявляем переменные
        const manifest = {};
        const url = req.url;

        // Создаем рендерер для выбранного фреймворка
        const renderFactory = (await this.vite!.ssrLoadModule(this.resolve('./RenderFactory.js')))!.RendererFactory as typeof RendererFactory;
        const renderer = renderFactory.createRenderer(this.framework, {
            entryPoint: this.entryPoint,
            headConfig: this.config?.head,
            manifest
        });

        // Генерируем части вёрстки
        const appHtml = await renderer.renderApp();
        const headPayload = await renderer.renderHead();
        const preloadLinks = renderer.renderPreloadLinks([]);
        const context = renderer.getContext();

        // Генерируем конечный HTML
        const htmlResult = await this.generateHtml(url, appHtml, headPayload, preloadLinks, context);

        // Отправляем результат клиенту
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlResult);
    }

    async generateHtml(url: string, appHtml: string, headPayload: SSRHeadPayload, preloadLinks: string, ctx: FinalContext) {

        // Загружаем шаблон HTML
        const template = await this.vite!.transformIndexHtml(url, this.htmlTemplate);

        // Сериализируем стейты
        const states = ctx.context;
        const stores = simplifyPrefetchedStores(ctx.contextStores);
        const initialState = this.serializeContext(states, stores);

        // Генерируем конечный HTML
        let html = template
            .replace(`<!--preload-links-->`, preloadLinks)
            .replace(
                `<!--initial-state-->`,
                `<script>window.__INITIAL_STATE__="${initialState}"</script>`
            )
            .replace('<!--app-html-->', appHtml)
            .replace('<!--entry-point-->', this.entryPoint);
        Object.entries(headPayload).forEach(([key, value]) => {
            html = html.replace(`<!--${key}-->`, value as string)
        })

        return html;
    }

    resolve(p: string): string {
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        return path.resolve(dirname, p);
    }

    serializeContext(
        states: FinalContext['context'],
        stores: FinalContext['contextStores']
    ) {
        return serializeObject({
            states,
            stores
        }).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    }

    run() {
        this.app.use(this.vite!.middlewares);
        this.app.get('*', (req, res) => this.renderPage(req, res));

        const port = this.vite?.config?.server?.port || 3000;

        this.app.listen(port, () => {
            showDevServerMessage(port);
        });
    }
}

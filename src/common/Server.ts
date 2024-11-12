import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { type LssrConfig } from '../types/LssrConfig.js';
import { RendererFactory } from './RenderFactory.js';
import { SSRHeadPayload } from '@unhead/ssr';
import { FinalContext } from '../types/Context.js';
import { simplifyPrefetchedStores } from '../frameworks/vue/utils/PrefetchStoreConverter.js';
import { serializeObject } from '../utils/Serialize.js';
import { showDevServerMessage } from '../utils/Console.js';
import { Framework } from '../types/Framework.js';
import { readFile, rm } from 'fs/promises';
import { compileTsToJs } from '../utils/TSCompile.js';

export class Server {

    protected framework: Framework;
    public app: express.Express;
    protected config: LssrConfig = {};

    protected entryPoint: string = "/src/main.ts"
    protected distPath: string = "/dist"
    protected htmlTemplate: string = ""

    constructor(framework: Framework) {
        this.app = express();
        this.framework = framework;
    }

    async initialize() {
        this.config = await this.loadConfig();
        this.entryPoint = this.config?.entry || this.entryPoint;
        if (!this.entryPoint.startsWith("/")) this.entryPoint = `/${this.entryPoint}`;

        this.distPath = this.resolve(this.config?.dist as string, true);

        this.htmlTemplate = await this.loadHtmlTemplate();

        await this.initializeMiddlewares();
    }

    async initializeMiddlewares() {
        const compression = (await import('compression')).default
        const sirv = (await import('sirv')).default
        this.app.use(compression())
        this.app.use("/", sirv(path.join(this.distPath, "/client"), { extensions: [] })) //TODO: продумать по поводу изменения базовой директории проекта
    }

    // Метод для рендеринга страницы
    async renderPage(req: express.Request, res: express.Response) {

        // Объявляем переменные
        const manifest = {};
        const url = req.url;

        // Создаем рендерер для выбранного фреймворка
        const rendererFactory = await this.getRendererFactory();
        const renderer = rendererFactory.createRenderer(this.framework, {
            entryPoint: this.getEntryPoint(),
            headConfig: this.config?.head,
            manifest
        });

        // Генерируем части вёрстки
        const appHtml = await renderer.renderApp(url);
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
        const template = await this.transformHtml(url, this.htmlTemplate);
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
            .replace('<!--entry-styles-->', '')
            .replace('<!--entry-scripts-->', `<script type="module" src="${this.entryPoint}"></script>`);
        Object.entries(headPayload).forEach(([key, value]) => {
            html = html.replace(`<!--${key}-->`, value as string)
        })

        return html;
    }

    async transformHtml(url: string, html: string) {
        return html;
    }

    async getRendererFactory() {
        return RendererFactory;
    }

    getEntryPoint() {
        return this.filePathToUrl(path.join(this.distPath, "/ssr/app.js"));
    }

    async loadConfig() {
        await compileTsToJs(this.resolve("/lssr.config.ts", true), this.resolve("/lssr.config.js", true));
        const path = this.resolve("/lssr.config.js", true);
        const config = (await import(this.filePathToUrl(path)))!.default as LssrConfig;
        await rm(path);
        return config;
    }

    async loadHtmlTemplate() {
        return await readFile(
            path.join(this.distPath, "/index.html"),
            "utf-8"
        );
    }

    filePathToUrl(path: string) {
        return `file://${path.replace(/\\/g, '/')}`
    }

    resolve(p: string, root: boolean = false): string {
        if (root) return path.join(process.cwd(), p);
        return p.startsWith("/") ?
            path.join(process.cwd(), p) :
            path.resolve(path.dirname(fileURLToPath(import.meta.url)), p);
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
        this.app.get('*', (req, res) => this.renderPage(req, res));
        const port = this.config.port || 3000;
        this.app.listen(port, () => {
            showDevServerMessage(port);
        });
    }
}

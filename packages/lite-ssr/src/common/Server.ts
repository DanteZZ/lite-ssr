import { type LssrConfig, Renderer, logError, filePathToUrl } from '@lite-ssr/core';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { readFile } from 'fs/promises';

import { showDevServerMessage } from '../utils/Console.js';

export class Server {
    public app: express.Express;
    protected config: LssrConfig;

    protected entryPoint: string = "/src/main.ts"
    protected distPath: string = "/dist"
    protected htmlTemplate: string = ""

    constructor(config: LssrConfig) {
        this.app = express();
        this.config = config;
    }

    async initialize() {
        this.entryPoint = this.config?.entry || this.entryPoint;
        if (!this.entryPoint.startsWith("/")) this.entryPoint = `/${this.entryPoint}`;

        this.distPath = this.resolve(this.config?.dist as string, true);
        this.htmlTemplate = await this.loadHtmlTemplate();

        await this.initializeMiddlewares();
    }

    async initializeMiddlewares() {
        const compression = (await import(/* @vite-ignore */'compression')).default
        const sirv = (await import(/* @vite-ignore */'sirv')).default
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
        let renderer: Renderer;
        try {
            renderer = await rendererFactory.createRenderer(this.config!.renderer, {
                entryPoint: this.getEntryPoint(),
                config: this.config,
                manifest
            }, (p: string) => this.loadModule(p));
        } catch (e) {
            logError(e as string);
            return;
        }

        // Генерируем конечный HTML
        const template = await this.transformHtml(url, this.htmlTemplate);
        const htmlResult = await renderer.generateHtml(url, template);

        // Отправляем результат клиенту
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlResult);
    }

    async transformHtml(url: string, html: string) {
        return html;
    }

    async getRendererFactory() {
        return (await this.loadModule('./RenderFactory.js'))!.RendererFactory
    }

    async loadModule(path: string) {
        return await import(/* @vite-ignore */path);
    }

    getEntryPoint() {
        return this.filePathToUrl(path.join(this.distPath, "/ssr/app.js"));
    }

    async loadHtmlTemplate() {
        return await readFile(
            path.join(this.distPath, "/index.html"),
            "utf-8"
        );
    }

    filePathToUrl(path: string) {
        return filePathToUrl(path);
    }

    resolve(p: string, root: boolean = false): string {
        if (root) return path.join(process.cwd(), p);
        return p.startsWith("/") ?
            path.join(process.cwd(), p) :
            path.resolve(path.dirname(fileURLToPath(import.meta.url)), p);
    }

    run() {
        this.app.get('*', (req, res) => this.renderPage(req, res));
        const port = this.config.port || 3000;
        this.app.listen(port, () => {
            showDevServerMessage(port);
        });
    }
}

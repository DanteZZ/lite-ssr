import { type LssrConfig, Renderer, logError, filePathToUrl, formatErrorToHtml } from '@lite-ssr/core';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { readFile } from 'fs/promises';

import { showDevServerMessage } from '../utils/Console.js';
import { defineServerHook, dispatchServerHook } from '../utils/Hooks.js';
import { PluginSystem } from '@lite-ssr/core/shared';

export class Server {
    public app: express.Express;
    protected config: LssrConfig;

    protected entryPoint: string = "/src/main.ts"
    protected distPath: string = "/dist"
    protected htmlTemplate: string = ""
    protected pluginSystem = new PluginSystem(this)
    protected renderer?: Renderer
    public defineHook = defineServerHook

    constructor(config: LssrConfig) {
        this.app = express();
        this.app.use(cookieParser());

        this.config = config;
        process.env.LSSR_PORT = this.config.port?.toString();
    }

    protected registerPlugins() {
        if (this.config.plugins && this.config.plugins.length > 0) {
            for (const plugin of this.config.plugins) {
                this.pluginSystem.registerPlugin(plugin, plugin.config)
            }
        }
    }

    public async initialize() {
        this.entryPoint = this.config?.entry || this.entryPoint;
        if (!this.entryPoint.startsWith("/")) this.entryPoint = `/${this.entryPoint}`;

        this.distPath = this.resolve(this.config?.dist as string, true);
        this.htmlTemplate = await this.loadHtmlTemplate();

        this.registerPlugins();
        await this.pluginSystem.initializePlugins();
        await dispatchServerHook('afterInitializePlugins', this.hookData());

        await dispatchServerHook('beforeMiddlewares', this.hookData());
        await this.initializeMiddlewares();
        await dispatchServerHook('afterMiddlewares', this.hookData());
        await this.initializeRenderer();
    }

    async initializeRenderer() {
        const rendererFactory = await this.getRendererFactory();
        try {
            this.renderer = await rendererFactory.createRenderer(this.config!.renderer, {
                entryPoint: this.getEntryPoint(),
                config: this.config,
                manifest: {}
            }, (p: string) => this.loadModule(p));
        } catch (e) {
            logError(e as string);
            return;
        };
        await this.renderer!.initializePlugins();
    }

    protected async initializeMiddlewares() {
        const compression = (await import(/* @vite-ignore */'compression')).default
        const sirv = (await import(/* @vite-ignore */'sirv')).default
        this.app.use(compression())
        this.app.use("/", sirv(path.join(this.distPath, "/client"), { extensions: [] }))
    }

    // Метод для рендеринга страницы
    protected async renderPage(req: express.Request, res: express.Response) {

        // Объявляем переменные
        const url = req.url;
        // Создаем рендерер для выбранного фреймворка
        if (this.renderer) {
            try {
                this.renderer.setReq(req);
                this.renderer.setRes(res);
                await dispatchServerHook('request', this.hookRequestData(url, req, res, this.renderer));
                await dispatchServerHook('renderStart', this.hookRequestData(url, req, res, this.renderer));
                // Генерируем конечный HTML
                const template = await this.transformHtml(url, this.htmlTemplate);
                const htmlResult = await this.renderer.generateHtml(url, template);

                await dispatchServerHook('renderEnd', this.hookRequestData(url, req, res, this.renderer));
                // Отправляем результат клиенту
                await dispatchServerHook('beforeResponse', this.hookRequestData(url, req, res, this.renderer));
                res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlResult);
                await dispatchServerHook('afterResponse', this.hookRequestData(url, req, res, this.renderer));
            } catch (e) {
                res.status(this.renderer.status || 200).set({ 'Content-Type': 'text/html' }).end(formatErrorToHtml(e as Error));
            }
        } else {
            throw new Error("Не удалось инициализировать рендерер");
        }
    }

    protected async transformHtml(url: string, html: string) {
        return html;
    }

    protected async getRendererFactory() {
        return (await this.loadModule('./RenderFactory.js'))!.RendererFactory
    }

    protected async loadModule(path: string) {
        return await import(/* @vite-ignore */path);
    }

    protected async loadHtmlTemplate() {
        return await readFile(
            path.join(this.distPath, "/index.html"),
            "utf-8"
        );
    }

    protected hookData() {
        return {
            $app: this.app,
            $config: this.config,
            $entry: this.entryPoint,
            $renderCreator: this.config.renderer
        }
    }

    protected hookRequestData(url: string, req: any, res: any, $renderer: Renderer) {
        return {
            $app: this.app,
            $config: this.config,
            $entry: this.entryPoint,
            req: req as Request,
            res: res as Response,
            $renderer,
            url
        }
    }
    protected getEntryPoint() {
        return this.filePathToUrl(path.join(this.distPath, "/ssr/app.js"));
    }

    protected filePathToUrl(path: string) {
        return filePathToUrl(path);
    }

    protected resolve(p: string, root: boolean = false): string {
        if (root) return path.join(process.cwd(), p);
        return p.startsWith("/") ?
            path.join(process.cwd(), p) :
            path.resolve(path.dirname(fileURLToPath(import.meta.url)), p);
    }

    public run() {
        this.app.get('*', (req, res) => this.renderPage(req, res));
        const port = this.config.port || 3000;
        this.app.listen(port, () => {
            showDevServerMessage(port);
        });
    }
}

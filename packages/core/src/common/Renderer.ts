import { PluginSystem, serializeObject } from "@lite-ssr/core/shared";
import { Manifest } from "./ManifestUtils.js";
import { getPreloadLinks } from "./PreloadUtils.js";
import { LssrConfig } from "../types/LssrConfig.js";
import { defineRendererPlugin } from "../shared/RendererPlugin.js";
import type { Request, Response } from "express";

export abstract class Renderer {
    protected entryPoint: string;
    protected manifest: Manifest | null = null;
    protected load: Function;
    protected config: LssrConfig;
    protected pluginSystem = new PluginSystem<unknown>(this);
    public html: string = "";
    public req?: Request;
    public res?: Response;

    constructor(
        entryPoint: string,
        config: LssrConfig,
        manifest: Manifest | null,
        load: Function
    ) {
        this.entryPoint = entryPoint;
        this.config = config;
        this.manifest = manifest;
        this.load = load;
    }

    static definePlugin<Config>(...args: Parameters<typeof defineRendererPlugin>) {
        return defineRendererPlugin<unknown, Config>(...args)
    }

    async initializePlugins() {
        if (this.config.rendererPlugins && this.config.rendererPlugins.length > 0) {
            for (const plugin of this.config.rendererPlugins) {
                this.pluginSystem.registerPlugin(plugin, plugin.config)
            }
        }
        await this.pluginSystem.initializePlugins();
    }

    // Методы
    renderPreloadLinks(modules: string[]): string {
        return getPreloadLinks(modules, this.manifest);
    };
    async generateHtml(url: string, template: string) {
        let t = template;
        t = this.fillPreloadLinks(t);
        t = await this.fillApp(t, url);
        t = this.fillInitialState(t);
        t = this.fillEntryStyles(t);
        t = this.fillEntryScripts(t);

        this.html = t;


        return this.html;
    }

    public setReq(req: Request) {
        this.req = req;
    }
    public setRes(res: Response) {
        this.res = res;
    }

    public getReq(): Request {
        if (this.req) {
            return this.req;
        } else {
            throw new Error("Undefined request");
        }
    }

    public getRes(): Response {
        if (this.res) {
            return this.res;
        } else {
            throw new Error("Undefined response");
        }
    }

    static async getHtmlTemplate(): Promise<string | null> {
        return null;
    };

    // Методы наполнение
    fillPreloadLinks(t: string) { return t.replace(`<!--preload-links-->`, this.renderPreloadLinks([])) }
    fillEntryStyles(t: string) { return t.replace('<!--entry-styles-->', '') }
    fillEntryScripts(t: string) { return t.replace('<!--entry-scripts-->', `<script type="module" src="${this.entryPoint}"></script>`) }
    fillInitialState(t: string) {
        return t.replace(
            `<!--initial-state-->`,
            `<script>window.__INITIAL_STATE__="${serializeObject(
                this.getInitialState()
            ).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            }"</script>`
        )
    }
    async fillApp(t: string, url: string) {
        return t.replace(
            `<!--app-html-->`,
            await this.renderApp(url)
        )
    }

    // Абстрактные обязательные методы
    abstract renderApp(url: string): Promise<string>;
    abstract getInitialState(): Record<string, any>
}
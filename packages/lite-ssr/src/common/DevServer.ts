import { createServer, ViteDevServer } from 'vite';
import { showDevServerMessage } from '../utils/Console.js';
import { Server } from './Server.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class DevServer extends Server {

    private vite?: ViteDevServer;

    async initialize() {
        this.vite = await createServer({
            root: process.cwd(),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        this.vite.config.env.LSSR_PORT = this.config.port;
        await super.initialize();
    }


    async initializeMiddlewares() { }

    async transformHtml(url: string, html: string) {
        return await this.vite!.transformIndexHtml(url, html);
    }

    async getRendererFactory() {
        return (await super.loadModule(this.filePathToUrl(this.resolve('./RenderFactory.js'))))!.RendererFactory
    }

    async loadModule(path: string) {
        return (await this.vite!.ssrLoadModule(path))
    }

    getEntryPoint() {
        return this.entryPoint;
    }

    async loadHtmlTemplate() {
        let htmlPath: string;
        if (this.config?.html) {
            htmlPath = this.resolve(this.config?.html, true);
        } else {
            const rendererTemplate = (await (this.config.renderer as any).getHtmlTemplate()) as string | null;
            if (rendererTemplate) return rendererTemplate;
            htmlPath = path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                "../../index.html"
            );
        }
        return await readFile(
            htmlPath,
            "utf-8"
        );
    }

    run() {
        this.app.use(this.vite!.middlewares);
        this.app.get('*', (req, res) => this.renderPage(req, res));

        const port = this.config?.port || 3000;

        this.app.listen(port, () => {
            showDevServerMessage(port);
        });
    }
}

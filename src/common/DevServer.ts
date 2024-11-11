import { createServer, ViteDevServer } from 'vite';
import { type LssrConfig } from '../types/LssrConfig.js';
import { showDevServerMessage } from '../utils/Console.js';
import { Framework } from '../types/Framework.js';
import { Server } from './Server.js';

export class DevServer extends Server {

    private vite?: ViteDevServer;

    constructor(framework: Framework) {
        super(framework);
    }

    async initialize() {
        this.vite = await createServer({
            root: process.cwd(),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        await super.initialize();
    }

    async transformHtml(url: string, html: string) {
        return await this.vite!.transformIndexHtml(url, html);
    }

    async getRendererFactory() {
        return (await this.vite!.ssrLoadModule(this.resolve('./RenderFactory.js')))!.RendererFactory
    }

    async loadConfig() {
        return (await this.vite!.ssrLoadModule(this.resolve('/lssr.config.ts')))!.default as LssrConfig;
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

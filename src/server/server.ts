import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
//@ts-ignore
import { createServer } from 'vite';
import express, { Request, Response, NextFunction } from 'express';
import { htmlTemplate } from '../gen/htmlTemplate.js';
import { lssrViteConfig } from '../utils/vite.js';
import { serializeObject } from '../utils/converter.js';

const isProd = process.env.NODE_ENV === 'production';

// Helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p: string): string => path.resolve(__dirname, p);

type customizedConfig = {
    lssr: lssrViteConfig
}

export async function serve(): Promise<void> {
    const manifest: Record<string, unknown> | null = isProd
        ? JSON.parse(fs.readFileSync(resolve('./dist/client/.vite/ssr-manifest.json'), 'utf-8'))
        : null;

    const app = express();
    const router = express.Router();

    const vite = await createServer({
        root: process.cwd(),
        server: { middlewareMode: true },
        appType: 'custom',
    });

    const entryPoint = (vite.config as unknown as customizedConfig)?.lssr?.entry || "/src/main.ts";

    router.get('/*', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const url = req.url;

            const template = await vite!.transformIndexHtml(url, htmlTemplate);
            const render = (await vite!.ssrLoadModule(resolve('./renderer.js'))).render;
            const [appHtml, preloadLinks, context] = await render(entryPoint, url, manifest);

            const html = template
                .replace(`<!--preload-links-->`, preloadLinks)
                .replace(`<!--initial-state-->`, `<script>window.__INITIAL_STATE__="${serializeObject(context).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                    }"</script>`)
                .replace('<!--app-html-->', appHtml)
                .replace('<!--entry-point-->', entryPoint);

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            if (vite) {
                vite.ssrFixStacktrace(e as Error);
            }
            next(e);
        }
    });

    app.use(vite.middlewares);
    app.use('/', router);

    const port = vite.config?.server?.port || 3000;

    app.listen(vite.config?.server?.port || 3000, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}
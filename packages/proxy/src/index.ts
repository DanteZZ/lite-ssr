import { definePlugin } from "lite-ssr";
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Options } from 'http-proxy-middleware';

type ProxySettings = {
    [key: string]: Options
} | Array<[string, Options]>

export const proxyPlugin = definePlugin<ProxySettings>('proxy', ({ defineHook }, config) => {
    defineHook('afterMiddlewares', ({ $app }) => {
        const items: Array<[string, Options]> = Array.isArray(config) ? config : Object.entries(config);
        items.forEach(([path, opts]) => {
            $app.use(path, createProxyMiddleware(opts))
        });
    })
})

export default proxyPlugin;
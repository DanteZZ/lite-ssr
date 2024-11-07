import { basename } from 'node:path';
import { renderToString } from 'vue/server-renderer';
import { type App } from 'vue';
import { createHead, Head } from '@unhead/vue';
import { renderSSRHead, SSRHeadPayload } from '@unhead/ssr';

interface Manifest {
    [key: string]: string[];
}

interface Context {
    modules: string[];
}

interface ContextStores {
    [key: string]: any;
}

export async function render(entryPoint: string, headConfig: Head | undefined, manifest: Manifest | null = null): Promise<[string, SSRHeadPayload, string, Context, ContextStores]> {
    const { default: app } = await import(/* @vite-ignore */ `${entryPoint}?${Date.now()}`) as { default: App };
    const unhead = createHead();
    if (headConfig) unhead.push(headConfig);
    app.use(unhead);
    const context: Context = { modules: [] };
    const contextStores: ContextStores = {};

    app.provide('context', context);
    app.provide('contextStores', contextStores);

    const html = await renderToString(app);
    const head = await renderSSRHead(unhead);

    let preloadLinks = '';

    if (manifest) {
        preloadLinks = renderPreloadLinks(context.modules, manifest);
    }

    return [html, head, preloadLinks, context, contextStores];
}

function renderPreloadLinks(modules: string[], manifest: Manifest): string {
    let links = '';
    const seen = new Set<string>();

    modules.forEach((id) => {
        const files = manifest[id];
        if (files) {
            files.forEach((file) => {
                if (!seen.has(file)) {
                    seen.add(file);
                    const filename = basename(file);
                    if (manifest[filename]) {
                        for (const depFile of manifest[filename]) {
                            links += renderPreloadLink(depFile);
                            seen.add(depFile);
                        }
                    }
                    links += renderPreloadLink(file);
                }
            });
        }
    });

    return links;
}

function renderPreloadLink(file: string): string {
    if (file.endsWith('.js')) {
        return `<link rel="modulepreload" crossorigin href="${file}">`;
    } else if (file.endsWith('.css')) {
        return `<link rel="stylesheet" href="${file}">`;
    } else if (file.endsWith('.woff')) {
        return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
    } else if (file.endsWith('.woff2')) {
        return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
    } else if (file.endsWith('.gif')) {
        return `<link rel="preload" href="${file}" as="image" type="image/gif">`;
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return `<link rel="preload" href="${file}" as="image" type="image/jpeg">`;
    } else if (file.endsWith('.png')) {
        return `<link rel="preload" href="${file}" as="image" type="image/png">`;
    } else {
        return '';
    }
}

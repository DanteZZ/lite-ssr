import { basename } from 'node:path';
import { renderToString } from 'vue/server-renderer';
import { type App } from 'vue';

interface Manifest {
    [key: string]: string[];
}

interface Context {
    modules: string[];
}

export async function render(entryPoint: string, manifest: Manifest | null = null): Promise<[string, string, Context]> {
    const { default: app } = await import(/* @vite-ignore */  `${entryPoint}?${Date.now()}`) as { default: App };

    const context: Context = { modules: [] };
    app.provide('context', context);

    const html = await renderToString(app);
    let preloadLinks = '';

    if (manifest) {
        preloadLinks = renderPreloadLinks(context.modules, manifest);
    }

    return [html, preloadLinks, context];
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

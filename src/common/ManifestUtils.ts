import { basename } from 'path';

export interface Manifest {
    [key: string]: string[];
}

/**
 * Генерация ссылок для предварительной загрузки файлов, указанных в манифесте
 * @param modules Модули, для которых нужно рендерить preload-ссылки
 * @param manifest Манифест с файлами для предварительной загрузки
 * @returns Строка с HTML-ссылками для preload
 */
export function renderPreloadLinks(modules: string[], manifest: Manifest): string {
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

/**
 * Генерация HTML-ссылки для preload для одного файла
 * @param file Путь к файлу
 * @returns Строка с HTML-ссылкой для preload
 */
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
        return `<link rel="preload" href= "${file}" as="image" type="image/png">`;
    } else {
        return '';
    }
}
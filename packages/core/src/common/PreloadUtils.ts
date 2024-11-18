import { renderPreloadLinks } from './ManifestUtils.js';

/**
 * Получение и рендеринг preload-ссылок из контекста и манифеста
 * @param modules Модули для которых нужно получить preload-ссылки
 * @param manifest Манифест с файлами
 * @returns Строка с HTML-ссылками для preload
 */
export function getPreloadLinks(modules: string[], manifest: Record<string, any> | null): string {
    if (!manifest) {
        return '';
    }

    return renderPreloadLinks(modules, manifest);
}
import { definePlugin } from "@lite-ssr/vue/renderer";
import { updateCache, getCache, getFullCache } from '../common/Cache.js';
import { App } from "vue";

interface CacheConfig {
    name: string;
    fetcher: () => Promise<any>;
    refreshInterval?: number;
}

export const vueCachedDataPlugin = definePlugin('vue-cached-data', async ({ defineHook }, config: CacheConfig[]) => {
    // Обновляем данные асинхронно
    for (const { name, fetcher, refreshInterval } of config) {
        await updateCache(name, fetcher);
        if (refreshInterval) {
            setInterval(() => updateCache(name, fetcher), refreshInterval);
        }
    }

    defineHook('fillInitialState', ({ initialState }) => {
        initialState.cached = getFullCache();
    })

    // Хук для передачи данных в SSR приложение
    defineHook('init', ({ $app }) => {
        $app.provide('dataCache', getCache);
    });
});
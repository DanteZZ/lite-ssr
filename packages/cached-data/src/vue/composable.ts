import { inject, ref } from "vue";

function isClient() { return typeof window !== "undefined" };

let cache: Record<string, any> = {};

if (isClient()) {
    cache = JSON.parse((window as any).__INITIAL_STATE__)?.cached || {};
}



export function useCachedData(name: string) {
    if (typeof window === "undefined") {
        const getCache = inject<Function>('dataCache');
        if (!getCache || !getCache(name)) {
            throw new Error(`Data with name "${name}" not found in cache.`);
        }
        return ref(getCache(name)?.data);
    } else {
        if (!cache || !cache[name]) {
            throw new Error(`Data with name "${name}" not found in cache.`);
        }
        return ref(cache[name]);
    }
}
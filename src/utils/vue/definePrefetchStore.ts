import { isRef, inject, onServerPrefetch, isReactive, ref, reactive } from 'vue';

type StoreData = [
    Record<string, Function>,
    Record<string, any>,
];

type simplifiedValue = {
    type: string,
    value: any
}

function splitStoreData(obj: Record<string, any>): StoreData {
    const asyncFunctions: Record<string, Function> = {};
    const states: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Function && value.constructor.name === 'AsyncFunction') {
            asyncFunctions[key] = value;
        } else {
            // Прочее (например, примитивы, объекты)
            states[key] = value;
        }
    }

    return [asyncFunctions, states];
}

function processValue(value: any) {
    if (isRef(value)) {
        return { type: 'ref', value: value.value };
    } else if (isReactive(value)) {
        return { type: 'reactive', value };
    } else {
        return { type: null, value };
    }
}

function processAsyncFunctions<T>(functions: T): T {
    const result = {} as Record<string, Function>;
    const isGetPrefetched: Record<string, boolean> = {};
    for (const [key, fn] of Object.entries(functions as Record<string, Function>)) {
        isGetPrefetched[key] = false;
        result[key] = async (...args: any[]) => {
            if (import.meta.env.SSR === true) {
                isGetPrefetched[key] = true;
                onServerPrefetch(async () => {
                    await fn(...args);
                });
            } else {
                if (!isGetPrefetched[key]) {
                    isGetPrefetched[key] = true;
                } else {
                    await fn(...args);
                }
            }
        }
    }
    return result as T;
}

function processStates<T>(ctx: Record<string, any>, states: T): T {
    for (const [key, value] of Object.entries(states as Record<string, any>)) {
        if (!(value instanceof Function)) {
            ctx[key] = value;
        }
    }
    return states;
}

export function simplifyPrefetchedStores<T>(ctx: T): T {
    const data: Record<string, any> = {};
    for (const [storeName, store] of Object.entries(ctx as Record<string, any>)) {
        data[storeName] = {};
        for (const [key, value] of Object.entries(store)) {
            data[storeName][key] = processValue(value);
        }
        data[storeName].__initialized = false;
    }
    return data as T;
}

export function enrichPrefetchedStores<T>(ctx: T): T {
    for (const [storeName, store] of Object.entries(ctx as Record<string, any>)) {
        for (const [key, value] of Object.entries(store)) {
            const v = value as simplifiedValue;
            if (v.type === "ref") {
                (ctx as Record<string, any>)[storeName][key] = ref(v.value)
            } else if (v.type === "reactive") {
                (ctx as Record<string, any>)[storeName][key] = reactive(v.value)
            } else {
                (ctx as Record<string, any>)[storeName][key] = v.value;
            }
        }
    }
    return ctx;
}

export function definePrefetchStore<T extends () => any>(
    name: string,
    fn: T
): () => ReturnType<T> {
    return () => {
        const stores = inject<Record<string, any>>('contextStores', {});
        if (!stores[name] || !stores?.[name]?.__initialized) {

            const needInitialize = (stores[name] && !stores?.[name]?.__initialized);

            if (!stores[name]) stores[name] = { __initialized: true };

            const originalStore = fn();
            const [asyncFunctions, states] = splitStoreData(originalStore);

            if (needInitialize) {
                stores[name] = {
                    ...stores[name],
                    ...processAsyncFunctions(asyncFunctions)
                }
            } else {
                stores[name] = {
                    ...stores[name],
                    ...processAsyncFunctions(asyncFunctions),
                    ...processStates(stores[name], states)
                }
            }
        }
        return stores[name]
    };
}

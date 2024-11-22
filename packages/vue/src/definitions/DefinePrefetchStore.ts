import { inject, onServerPrefetch } from 'vue';
import { enrichPrefetchedStoreStates } from '../utils/PrefetchStoreConverter.js';
import { isSSR } from '@lite-ssr/core/shared';

export type AsyncFunctions = Record<string, (...args: any[]) => Promise<any>>;
export type States = Record<string, any>;
export type Store = {
    __initialized: boolean;
    [key: string]: any;
};

// Разделение данных стора на асинхронные функции и обычные состояния
function splitStoreData(obj: Record<string, any>): [AsyncFunctions, States] {
    const asyncFunctions: AsyncFunctions = {};
    const states: States = {};

    Object.entries(obj).forEach(([key, value]) => {
        if (value instanceof Function && value.constructor.name === 'AsyncFunction') {
            asyncFunctions[key] = value;
        } else {
            states[key] = value;
        }
    });

    return [asyncFunctions, states];
}

// Обработка асинхронных функций с кэшированием для SSR
function processAsyncFunctions<T>(functions: T): T {
    const result = {} as Record<string, Function>;
    const isGetPrefetched: Record<string, boolean> = {};

    Object.entries(functions as AsyncFunctions).forEach(([key, fn]) => {
        isGetPrefetched[key] = false;
        result[key] = async (...args: any[]) => {
            if (isSSR()) {
                isGetPrefetched[key] = true;
                onServerPrefetch(() => fn(...args));
            } else if (!isGetPrefetched[key]) {
                isGetPrefetched[key] = true;
            } else {
                await fn(...args);
            }
        };
    });

    return result as T;
}

// Обработка состояний и их инъекция в контекст
function processStates<T>(ctx: Record<string, any>, states: T): T {
    Object.entries(states as States).forEach(([key, value]) => {
        if (!(value instanceof Function)) {
            ctx[key] = value;
        }
    });

    return states;
}

// Функция для определения и инициализации store с предзагрузкой данных
export function definePrefetchStore<T extends () => any>(name: string, fn: T): () => ReturnType<T> {
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
                    ...enrichPrefetchedStoreStates(states, stores[name]),
                    ...processAsyncFunctions(asyncFunctions),
                    __initialized: true,
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
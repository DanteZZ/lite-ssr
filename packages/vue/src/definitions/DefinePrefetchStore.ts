import { inject, onServerPrefetch } from 'vue';
import { enrichPrefetchedFuncCalls, enrichPrefetchedStoreStates } from '../utils/PrefetchStoreConverter.js';
import { isSSR } from '@lite-ssr/core/shared';

export type AsyncFunctions = Record<string, (...args: any[]) => Promise<any>>;
export type States = Record<string, any>;
export type Store = {
    __filled: boolean;
    __calls: Record<string, number>
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
function processAsyncFunctions<T>(functions: T, store: Store): T {
    const result = {} as Record<string, Function>;
    const isGetPrefetched: Record<string, boolean> = {};
    Object.entries(functions as AsyncFunctions).forEach(([key, fn]) => {
        isGetPrefetched[key] = false;
        result[key] = async (...args: any[]) => {
            if (isSSR()) {
                store.__calls[key] += 1;
                isGetPrefetched[key] = true;
                const promise = fn(...args);
                onServerPrefetch(() => promise);
                return promise;
            } else if (!isGetPrefetched[key] && store.__calls?.[key] > 0) {
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
        if (!stores[name] || !stores?.[name]?.__filled) {

            const needFill = (stores[name] && !stores?.[name]?.__filled);

            if (!stores[name]) stores[name] = { __filled: true };

            const originalStore = fn();
            const [asyncFunctions, states] = splitStoreData(originalStore);

            const asyncFunctionCalls = Object.fromEntries(Object.entries(asyncFunctions).map(([fName]) => [fName, 0]))

            stores[name] = {
                ...stores[name],
                __calls: needFill ? enrichPrefetchedFuncCalls(asyncFunctionCalls, stores[name]) : asyncFunctionCalls
            }

            if (needFill) {
                stores[name] = {
                    ...stores[name],
                    ...enrichPrefetchedStoreStates(states, stores[name]),
                    ...processAsyncFunctions(asyncFunctions, stores[name]),
                    __filled: true,
                }
            } else {
                stores[name] = {
                    ...stores[name],
                    ...processAsyncFunctions(asyncFunctions, stores[name]),
                    ...processStates(stores[name], states)
                }
            }
        }
        return stores[name]
    };
}
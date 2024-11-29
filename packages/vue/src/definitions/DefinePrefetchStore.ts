import { inject, onServerPrefetch } from 'vue';
import { enrichPrefetchedFuncCalls, enrichPrefetchedStoreStates } from '../utils/PrefetchStoreConverter.js';
import { isSSR } from '@lite-ssr/core/shared';

export type AsyncFunctions = Record<string, (...args: any[]) => Promise<any>>;
export type States = Record<string, any>;
export type Store = {
    __filled: boolean; // Indicates if the store has been populated with prefetched data
    __calls: Record<string, number>; // Tracks the number of times async functions have been called
    [key: string]: any; // Additional properties can be stored dynamically
};

/**
 * Splits the provided object into two categories: asynchronous functions and static states.
 *
 * @param obj - The object containing both functions and states.
 * @returns A tuple with async functions as the first element and static states as the second.
 */
function splitStoreData(obj: Record<string, any>): [AsyncFunctions, States] {
    const asyncFunctions: AsyncFunctions = {};
    const states: States = {};

    // Iterate through the entries of the object
    Object.entries(obj).forEach(([key, value]) => {
        if (value instanceof Function && value.constructor.name === 'AsyncFunction') {
            asyncFunctions[key] = value; // Collect async functions
        } else {
            states[key] = value; // Collect static states
        }
    });

    return [asyncFunctions, states];
}

/**
 * Wraps asynchronous functions with server-side rendering (SSR) support.
 *
 * Each function is processed to ensure:
 * 1. It is registered with `onServerPrefetch` during SSR.
 * 2. It tracks calls for potential re-execution on the client.
 *
 * @param functions - The asynchronous functions to process.
 * @param store - The store object used to track calls and cache results.
 * @returns The processed asynchronous functions.
 */
function processAsyncFunctions<T>(functions: T, store: Store): T {
    const result = {} as Record<string, Function>;
    const isGetPrefetched: Record<string, boolean> = {};

    Object.entries(functions as AsyncFunctions).forEach(([key, fn]) => {
        isGetPrefetched[key] = false;

        result[key] = async (...args: any[]) => {
            if (isSSR()) {
                store.__calls[key] += 1; // Increment call count for SSR tracking
                isGetPrefetched[key] = true;

                // Wrap the function execution in a promise for `onServerPrefetch`
                const promise = fn(...args);
                onServerPrefetch(() => promise);

                return promise;
            } else if (!isGetPrefetched[key] && store.__calls?.[key] > 0) {
                // Mark the function as already prefetched to prevent redundant calls
                isGetPrefetched[key] = true;
            } else {
                // Execute the function on the client
                await fn(...args);
            }
        };
    });

    return result as T;
}

/**
 * Processes static states and injects them into the context.
 *
 * @param ctx - The context object where states are injected.
 * @param states - The static states to process.
 * @returns The processed states.
 */
function processStates<T>(ctx: Record<string, any>, states: T): T {
    Object.entries(states as States).forEach(([key, value]) => {
        if (!(value instanceof Function)) {
            ctx[key] = value; // Add non-function values to the context
        }
    });

    return states;
}

/**
 * Defines and initializes a store with support for data prefetching during SSR.
 *
 * The store is populated with async functions and static states, ensuring:
 * - Prefetched data is injected into the store on the server-side.
 * - Async functions are properly processed for client-side execution.
 *
 * @template T - The type of the store initialization function.
 * @param name - The unique name of the store.
 * @param fn - The function that initializes the store data.
 * @returns A function that returns the populated store object.
 */
export function definePrefetchStore<T extends () => any>(name: string, fn: T): () => ReturnType<T> {
    return () => {
        const stores = inject<Record<string, any>>('contextStores', {});

        if (!stores[name] || !stores?.[name]?.__filled) {
            const needFill = (stores[name] && !stores?.[name]?.__filled);

            if (!stores[name]) {
                stores[name] = { __filled: true }; // Mark the store as initialized
            }

            const originalStore = fn(); // Initialize the store
            const [asyncFunctions, states] = splitStoreData(originalStore); // Separate async functions and states
            const asyncFunctionCalls = Object.fromEntries(
                Object.entries(asyncFunctions).map(([fName]) => [fName, 0])
            );

            stores[name] = {
                ...stores[name],
                __calls: needFill
                    ? enrichPrefetchedFuncCalls(asyncFunctionCalls, stores[name])
                    : asyncFunctionCalls
            };

            if (needFill) {
                // Populate the store with prefetched data
                stores[name] = {
                    ...stores[name],
                    ...enrichPrefetchedStoreStates(states, stores[name]),
                    ...processAsyncFunctions(asyncFunctions, stores[name]),
                    __filled: true,
                };
            } else {
                // Process async functions and inject states
                stores[name] = {
                    ...stores[name],
                    ...processAsyncFunctions(asyncFunctions, stores[name]),
                    ...processStates(stores[name], states),
                };
            }
        }

        return stores[name]; // Return the store object
    };
}

import { isRef, isReactive } from 'vue';
import { States, Store } from '../definitions/DefinePrefetchStore.js';

/**
 * Processes a given value and converts it into the desired type.
 * 
 * - For `ref` values, it extracts the inner value using `value`.
 * - For other types, it returns the value as is.
 *
 * @param value - The value to process.
 * @returns The processed value.
 */
function processValue(value: any): any {
    if (isRef(value)) {
        return value.value;
    } else {
        return value;
    }
}

/**
 * Simplifies prefetched store data into a serializable format.
 * 
 * This function creates a cache-friendly representation of the context by extracting values
 * from `ref` or reactive properties and adding a `__filled` flag to indicate the store's state.
 *
 * @param ctx - The context containing stores to simplify.
 * @returns A simplified version of the context.
 */
export function simplifyPrefetchedStores<T>(ctx: T): T {
    const data: Record<string, any> = {};

    Object.entries(ctx as Record<string, any>).forEach(([storeName, store]) => {
        data[storeName] = {};

        Object.entries(store).forEach(([key, value]) => {
            data[storeName][key] = processValue(value);
        });

        data[storeName].__filled = false;
    });

    return data as T;
}

/**
 * Enriches a store's states using prefetched data from the server.
 * 
 * This function synchronizes the client's store state with data received from the server.
 * It handles `ref`, reactive objects, and special types like `Set` and `Map` to ensure proper updates.
 *
 * @param states - The client-side store states.
 * @param prefetchedStore - The server-side prefetched store data.
 * @returns The updated client-side states.
 */
export function enrichPrefetchedStoreStates(states: States, prefetchedStore: Store) {
    for (const key in states) {
        if (prefetchedStore.hasOwnProperty(key)) {
            const serverValue = prefetchedStore[key];
            const clientValue = states[key];

            if (isRef(clientValue)) {
                // If the client value is a `ref`, update its value.
                clientValue.value = serverValue;
            } else if (isReactive(clientValue)) {
                // If the client value is reactive, handle special types.
                if (serverValue === null || serverValue === undefined) {
                    // Clear reactive objects if the server sends null/undefined.
                    if (clientValue instanceof Set) {
                        clientValue.clear();
                    } else if (clientValue instanceof Map) {
                        clientValue.clear();
                    } else if (typeof clientValue === 'object') {
                        Object.keys(clientValue).forEach(prop => {
                            delete clientValue[prop];
                        });
                    }
                } else {
                    // Synchronize `Set` values.
                    if (clientValue instanceof Set) {
                        clientValue.clear();
                        if (serverValue instanceof Set) {
                            serverValue.forEach(item => clientValue.add(item));
                        } else if (Array.isArray(serverValue)) {
                            serverValue.forEach(item => clientValue.add(item));
                        } else {
                            clientValue.add(serverValue);
                        }
                    }
                    // Synchronize `Map` values.
                    else if (clientValue instanceof Map) {
                        clientValue.clear();
                        if (serverValue instanceof Map) {
                            serverValue.forEach((value, key) => {
                                clientValue.set(key, value);
                            });
                        } else if (Array.isArray(serverValue)) {
                            serverValue.forEach(([key, value]) => {
                                clientValue.set(key, value);
                            });
                        } else {
                            Object.entries(serverValue).forEach(([key, value]) => {
                                clientValue.set(key, value);
                            });
                        }
                    }
                    // Synchronize plain objects.
                    else {
                        Object.assign(clientValue, serverValue);
                    }
                }
            }
        }
    }
    return states;
}

/**
 * Enriches the function call counts for asynchronous functions in the store.
 * 
 * This ensures that the server-provided call counts are merged into the client-side store.
 *
 * @param calls - The client-side call counts for each function.
 * @param prefetchedStore - The server-side prefetched store containing call counts.
 * @returns The updated call counts.
 */
export function enrichPrefetchedFuncCalls(calls: Record<string, number>, prefetchedStore: Store) {
    for (const key in calls) {
        if (prefetchedStore.__calls.hasOwnProperty(key)) {
            calls[key] = prefetchedStore.__calls[key];
        }
    }
    return calls;
}

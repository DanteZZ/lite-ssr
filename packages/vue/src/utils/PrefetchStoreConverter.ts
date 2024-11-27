import { isRef, isReactive } from 'vue';
import { States, Store } from '../definitions/DefinePrefetchStore.js';

// Обработка значений для приведения их к нужному типу (ref, reactive или обычные значения)
function processValue(value: any): any {
    if (isRef(value)) {
        return value.value;
    } else {
        return value;
    }
}

// Упрощение данных для предварительной загрузки (создание кэша)
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


// Обогащение данных предварительной загрузки

export function enrichPrefetchedStoreStates(states: States, prefetchedStore: Store) {
    // Пройдем по всем ключам стейта
    for (const key in states) {
        if (prefetchedStore.hasOwnProperty(key)) {
            const serverValue = prefetchedStore[key];
            const clientValue = states[key];

            // Если это ref, просто заменяем значение
            if (isRef(clientValue)) {
                // Если пришёл объект, Map, Set или любой другой тип
                clientValue.value = serverValue;
            }
            // Если это реактивный объект
            else if (isReactive(clientValue)) {
                if (serverValue === null || serverValue === undefined) {
                    // Если сервер передает null или undefined, очищаем стейт
                    if (clientValue instanceof Set) {
                        clientValue.clear();
                    } else if (clientValue instanceof Map) {
                        clientValue.clear();
                    } else if (typeof clientValue === 'object') {
                        // Очищаем все свойства объекта
                        for (const prop in clientValue) {
                            delete clientValue[prop];
                        }
                    }
                } else {
                    // Обработка случая, когда данные приходят в виде Map или Set
                    if (clientValue instanceof Set) {
                        if (serverValue instanceof Set) {
                            clientValue.clear();
                            serverValue.forEach(item => clientValue.add(item));
                        } else {
                            // Если сервер прислал не Set, но ожидаем Set, очищаем и добавляем новые элементы
                            clientValue.clear();
                            if (Array.isArray(serverValue)) {
                                serverValue.forEach(item => clientValue.add(item));
                            } else {
                                // Если это объект или иной тип, преобразуем его в Set
                                clientValue.add(serverValue);
                            }
                        }
                    } else if (clientValue instanceof Map) {
                        if (serverValue instanceof Map) {
                            clientValue.clear();
                            serverValue.forEach((value, key) => {
                                clientValue.set(key, value);
                            });
                        } else {
                            // Если сервер прислал не Map, но ожидаем Map
                            clientValue.clear();
                            if (Array.isArray(serverValue)) {
                                serverValue.forEach(([key, value]) => {
                                    clientValue.set(key, value);
                                });
                            } else {
                                // Если это обычный объект
                                Object.entries(serverValue).forEach(([key, value]) => {
                                    clientValue.set(key, value);
                                });
                            }
                        }
                    } else {
                        // Если это обычный объект, просто обновляем его поля
                        Object.assign(clientValue, serverValue);
                    }
                }
            }
        }
    }
    return states;
}

// Обогащение количеств вызовов при загрузке

export function enrichPrefetchedFuncCalls(calls: Record<string, number>, prefetchedStore: Store) {
    for (const key in calls) {
        if (prefetchedStore.__calls.hasOwnProperty(key)) {
            calls[key] = prefetchedStore.__calls[key];
        };
    };
    return calls;
}

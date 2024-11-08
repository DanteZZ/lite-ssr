import { isRef, isReactive, ref, reactive } from 'vue';

type SimplifiedValue = {
    type: 'ref' | 'reactive' | null;
    value: any;
};

// Обработка значений для приведения их к нужному типу (ref, reactive или обычные значения)
function processValue(value: any): SimplifiedValue {
    if (isRef(value)) {
        return { type: 'ref', value: value.value };
    } else if (isReactive(value)) {
        return { type: 'reactive', value };
    } else {
        return { type: null, value };
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

        data[storeName].__initialized = false;
    });

    return data as T;
}

// Восстановление данных из кэша для использования в компоненте
export function enrichPrefetchedStores<T>(ctx: T): T {
    Object.entries(ctx as Record<string, any>).forEach(([storeName, store]) => {
        Object.entries(store).forEach(([key, value]) => {
            const v = value as SimplifiedValue;
            if (v.type === 'ref') {
                store[key] = ref(v.value);
            } else if (v.type === 'reactive') {
                store[key] = reactive(v.value);
            } else {
                store[key] = v.value;
            }
        });
    });
    return ctx;
}
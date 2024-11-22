import { isSSR } from '@lite-ssr/core/shared';
import { ref, onServerPrefetch, inject, Ref, UnwrapRef, getCurrentInstance, ComponentInternalInstance } from 'vue';

interface UseAsyncDataResult<T> {
    data: Ref<any, any> | Ref<Ref<any, any> & T, Ref<any, any> & T> | Ref<UnwrapRef<T> | null, T | UnwrapRef<T> | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
}

// Хэш-функция для генерации уникального кода из строки
function hashCode(s: string): number {
    return s.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) & 0xFFFFFFFF;
}

// Генерация уникального хэша пути компонента на основе его имени и инстанса
function generateComponentPathHash(name: string, instance: ComponentInternalInstance): string {
    let path = '';
    let parent = instance?.parent;
    while (parent) {
        const componentInfo = `${name}${JSON.stringify(instance.props)}${instance.vnode.key?.toString() ?? '0'}${parent.type.__file || parent.type.name || 'AnonymousComponent'}->`;
        path = componentInfo + path;
        parent = parent.parent;
    }
    return hashCode(path).toString();
}

// Основная логика для использования асинхронных данных с кэшированием
export function useAsyncData<T>(name: string, fetchDataFn: () => Promise<T>): UseAsyncDataResult<T> {
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);
    const loading = ref(true);

    // Получаем текущий инстанс компонента
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('useAsyncData must be called within a setup function.');
    }

    // Получаем контекст (например, для SSR или кэширования)
    const context = inject<Record<string, any>>('context', {});
    const key = `c-${generateComponentPathHash(name, instance)}`;

    // Попытка получить данные из контекста (кэширование)
    if (context[key]) {
        data.value = context[key];
        loading.value = false;
    } else {
        // Запуск асинхронного запроса на сервере или в браузере
        const fetchData = async () => {
            try {
                data.value = await fetchDataFn();
                context[key] = data.value;  // Кэшируем данные
            } catch (err) {
                error.value = err as Error;
            } finally {
                loading.value = false;
            }
        };

        // Для SSR используем onServerPrefetch
        onServerPrefetch(fetchData);

        // Для браузера сразу запускаем запрос
        if (!isSSR()) {
            fetchData();
        }
    }

    return { data, error, loading };
}
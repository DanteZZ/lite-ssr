import { ref, onServerPrefetch, inject, Ref, UnwrapRef, getCurrentInstance, ComponentInternalInstance } from 'vue';

interface UseAsyncDataResult<T> {
    data: Ref<any, any> | Ref<Ref<any, any> & T, Ref<any, any> & T> | Ref<UnwrapRef<T> | null, T | UnwrapRef<T> | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
}

function hashCode(s: string) {
    return s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function generateComponentPathHash(name: string, instance: ComponentInternalInstance): string {
    let path = '';
    let parent = instance?.parent;
    while (parent) {
        path = `${name}${JSON.stringify(instance.props)}${instance.vnode.key?.toString() || 0}${parent.type.__file || parent.type.name || 'AnonymousComponent'}->${path}`;
        parent = parent.parent;
    }
    return hashCode(path).toString();
}

export function useAsyncData<T>(name: string, fetchDataFn: () => Promise<T>): UseAsyncDataResult<T> {
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);
    const loading = ref(true);

    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('useAsyncData must be called within a setup function.');
    }
    // Используем кэш из контекста (например, из Vite SSR), если он доступен
    const context = inject<Record<string, any>>('context', {});
    const key = `c-${generateComponentPathHash(name, instance)}`;
    if (context[key]) {
        data.value = context[key];
        loading.value = false;
    } else {
        onServerPrefetch(async () => {
            try {
                data.value = await fetchDataFn();
                context[key] = data.value;
            } catch (e) {
                error.value = e as Error;
            } finally {
                loading.value = false;
            }
        });

        if (import.meta.env.SSR === false) {
            fetchDataFn()
                .then((result) => {
                    data.value = result;
                })
                .catch((e) => {
                    error.value = e as Error;
                })
                .finally(() => {
                    loading.value = false;
                });
        }
    }

    return { data, error, loading };
}
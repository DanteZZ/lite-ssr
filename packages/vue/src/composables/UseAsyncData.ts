import { isSSR } from '@lite-ssr/core/shared';
import { ref, onServerPrefetch, inject, Ref, UnwrapRef, getCurrentInstance, ComponentInternalInstance } from 'vue';

interface UseAsyncDataResult<T> {
    data: Ref<any, any> | Ref<Ref<any, any> & T, Ref<any, any> & T> | Ref<UnwrapRef<T> | null, T | UnwrapRef<T> | null>;
    error: Ref<Error | null>;
    loading: Ref<boolean>;
}

/**
 * Generates a hash code from a string.
 * This is used to create a unique identifier for caching purposes.
 *
 * @param s - The input string to hash.
 * @returns A 32-bit integer hash of the input string.
 */
function hashCode(s: string): number {
    return s.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) & 0xFFFFFFFF;
}

/**
 * Generates a unique component path hash based on the component's name and instance.
 * This helps create a consistent cache key for components, even across re-renders.
 *
 * @param name - The name of the component.
 * @param instance - The internal Vue component instance.
 * @returns A unique hash string representing the component's hierarchy and props.
 */
function generateComponentPathHash(name: string, instance: ComponentInternalInstance): string {
    let path = '';
    let parent = instance?.parent;

    // Traverse the parent hierarchy to construct a unique path
    while (parent) {
        const componentInfo = `${name}${JSON.stringify(instance.props)}${instance.vnode.key?.toString() ?? '0'}${parent.type.__file || parent.type.name || 'AnonymousComponent'}->`;
        path = componentInfo + path;
        parent = parent.parent;
    }

    return hashCode(path).toString();
}

/**
 * A composable to manage asynchronous data with support for caching and server-side rendering.
 *
 * @template T - The type of the data being fetched.
 * @param name - A unique name for the data context, used for caching.
 * @param fetchDataFn - A function that fetches the data asynchronously.
 * @returns An object containing:
 *   - `data`: A reactive reference to the fetched data.
 *   - `error`: A reactive reference to any error that occurred during the fetch.
 *   - `loading`: A reactive reference indicating the loading state.
 *
 * @throws If the function is called outside of a setup function.
 */
export async function useAsyncData<T>(name: string, fetchDataFn: () => Promise<T>): Promise<UseAsyncDataResult<T>> {
    const data = ref<T | null>(null); // Stores the fetched data
    const error = ref<Error | null>(null); // Stores any error that occurs
    const loading = ref(true); // Tracks the loading state

    // Retrieve the current Vue component instance
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('useAsyncData must be called within a setup function.');
    }

    // Access the injected context for SSR or client-side caching
    const context = inject<Record<string, any>>('context', {});
    const key = `c-${generateComponentPathHash(name, instance)}`; // Unique key for caching based on the component's path

    // Check if data is already in the context (cache)
    if (context[key]) {
        data.value = context[key];
        loading.value = false;
    } else {
        // Define the fetch logic
        const fetchData = async () => {
            try {
                data.value = await fetchDataFn(); // Fetch the data
                context[key] = data.value; // Cache the data
            } catch (err) {
                error.value = err as Error; // Handle any errors
            } finally {
                loading.value = false; // Set loading to false after completion
            }
        };

        const promise = fetchData();

        // For SSR, register the fetch promise to ensure it completes before rendering
        if (isSSR()) {
            onServerPrefetch(() => promise);
        }

        // Wait for the promise to resolve (also applies to client-side)
        await promise;
    }

    // Return reactive references for data, error, and loading state
    return { data, error, loading };
}

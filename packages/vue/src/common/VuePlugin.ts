import { deserializeObject, isSSR } from '@lite-ssr/core/shared';
import { App } from 'vue';

declare global {
    interface Window {
        __INITIAL_STATE__: string; // Global variable holding the serialized initial state from the server.
    }
}

/**
 * A Vue plugin to handle client-side hydration of server-rendered state.
 */
export const Plugin = {
    /**
     * The `install` method is invoked automatically when the plugin is used with a Vue app.
     *
     * @param app - The Vue application instance.
     */
    install(app: App) {
        // If not running on the server (client-side execution), hydrate the state.
        if (!isSSR()) {
            // Deserialize the server-provided initial state.
            const initial = deserializeObject(window.__INITIAL_STATE__);

            /**
             * Provide the deserialized state as two separate contexts:
             * - `context`: Contains the overall application state for useAsyncData.
             * - `contextStores`: Contains the prefetched data for defined stores with definePrefetchStore.
             */
            app.provide('context', initial.states);
            app.provide('contextStores', initial.stores);
        }
    },
};

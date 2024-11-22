import { deserializeObject, isSSR } from '@lite-ssr/core/shared';
import { App } from 'vue';

declare global {
    interface Window {
        __INITIAL_STATE__: string;
    }
}

export const Plugin = {
    install(app: App) {
        // Гидратация состояния на клиенте
        if (!isSSR()) {
            const initial = deserializeObject(window.__INITIAL_STATE__);
            app.provide('context', initial.states);
            app.provide('contextStores', initial.stores);
        }
    },
};
import { App } from 'vue';
import { deserializeObject } from '../../../utils/Serialize.js';
import { enrichPrefetchedStores } from './PrefetchStoreConverter.js';

declare global {
    interface Window {
        __INITIAL_STATE__: string;
    }
}

export const Plugin = {
    install(app: App) {
        // Гидратация состояния на клиенте
        if (!import.meta.env.SSR) {
            const initial = deserializeObject(window.__INITIAL_STATE__);
            app.provide('context', initial.states);
            app.provide('contextStores', enrichPrefetchedStores(initial.stores));
        }
    },
};
import { App } from 'vue';
import { deserializeObject } from '../converter.js';

declare global {
    interface Window {
        __INITIAL_STATE__: string;
    }
}

export const ssrVue = {
    install(app: App) {
        // Гидратация состояния на клиенте
        if (!import.meta.env.SSR) {
            app.provide('context', deserializeObject(window.__INITIAL_STATE__));
        }
    },
};
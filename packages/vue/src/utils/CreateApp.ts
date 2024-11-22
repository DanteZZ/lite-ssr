import { Component, createApp as create, defineComponent, h, Suspense } from 'vue';
import { Plugin } from './VuePlugin.js';
import { isSSR } from '@lite-ssr/core/shared';

const AppWrapper = (app: Component) => defineComponent({
    components: { App: app },
    render() {
        return h(Suspense, {}, {
            fallback: () => h('div', 'loading'),  // Рендерим fallback слот
            default: () => h(app),  // Основной компонент
        });
    }
});

export const createApp = (App: Component) => {
    const app = create(AppWrapper(App));
    const originalUse = app.use;
    app.use = (...args: Parameters<typeof originalUse>) => {
        // Здесь можно будет добавить необычные обработчики, к примеру отменять подключение плагинов, если они подключается на стороне сервера
        return originalUse(...args);
    }
    app.use(Plugin);
    const mount = app.mount;
    // @ts-ignore
    app.mount = () => {
        if (!isSSR()) {
            return mount("#app");
        };
    }
    return app;
}
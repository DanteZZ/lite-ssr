import { Component, createApp as create, defineComponent, h, Suspense } from 'vue';
import { Plugin } from './Plugin.js';
import { isSSR } from '../../../utils/IsSSR.js';

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
import { createApp, Component } from 'vue';
import { ssrVue } from './ssrVue.js';

export const createSSRApp = (App: Component) => {
    const app = createApp(App);
    app.use(ssrVue);
    const mount = app.mount;
    // @ts-ignore
    app.mount = () => {
        if (!import.meta.env.SSR) {
            return mount("#app");
        };
    }
    return app;
}
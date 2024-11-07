import { Component, defineComponent, h, Suspense } from 'vue';

export default (app: Component) => defineComponent({
    components: { App: app },
    render() {
        return h(Suspense, {}, {
            fallback: () => h('div', 'loading'),  // Рендерим fallback слот
            default: () => h(app),  // Основной компонент
        });
    }
});
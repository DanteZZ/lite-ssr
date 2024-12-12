import {
    Component,
    createApp as createServerApp,
    createSSRApp as createClientApp,
    defineComponent,
    h,
    Suspense
} from 'vue';
import { Plugin } from '../common/VuePlugin.js';
import { isSSR } from '@lite-ssr/core/shared';

/**
 * Wraps the provided application component in a `Suspense` component.
 *
 * This wrapper adds a loading fallback for asynchronous rendering, ensuring compatibility with 
 * asynchronous data fetching or lazy-loaded components during SSR or client-side hydration.
 *
 * @param app - The root application component.
 * @returns A new Vue component that includes the provided app inside a `Suspense` wrapper.
 */
const AppWrapper = (app: Component) => defineComponent({
    components: { App: app },
    render() {
        return h(Suspense, {}, {
            fallback: () => h('div', 'loading'), // Render the fallback while resolving async content
            default: () => h(app), // Render the main application component
        });
    }
});

/**
 * Factory function for creating a Vue application instance with SSR and client-side support.
 *
 * This function wraps the root application component in a `Suspense` wrapper, dynamically chooses
 * between the server-side (`createServerApp`) or client-side (`createSSRApp`) app creation methods,
 * and applies a global plugin.
 *
 * @param App - The root application component.
 * @returns A configured Vue application instance.
 */
export const createApp = (App: Component) => {

    // Check is need hydrating
    let needHydrating: boolean = true;
    if (!isSSR()) {
        needHydrating = document.getElementById("app")?.hasAttribute('non-h') ? false : true;
    }


    // Create the app instance based on the current rendering environment
    const app = isSSR() || !needHydrating
        ? createServerApp(AppWrapper(App)) // Server-side app creation
        : createClientApp(AppWrapper(App)); // Client-side app creation
    console.log('need hydrating', needHydrating);
    // Save the original `use` method for plugins
    const originalUse = app.use;

    /**
     * Override the `use` method to add custom behavior when registering plugins.
     *
     * For example, plugins can be conditionally applied based on whether the app is in SSR mode.
     */
    app.use = (...args: Parameters<typeof originalUse>) => {
        // Custom plugin logic can be added here
        return originalUse(...args);
    };

    // Register a global plugin
    app.use(Plugin);

    // Save the original `mount` method
    const mount = app.mount;

    /**
     * Override the `mount` method to ensure the app only mounts in a client environment.
     *
     * This prevents mounting during SSR, which should handle only rendering and data prefetching.
     */
    // @ts-ignore
    app.mount = () => {
        if (!isSSR()) {
            return mount("#app"); // Mount the app to the DOM in a client environment
        }
    };

    return app; // Return the configured app instance
};

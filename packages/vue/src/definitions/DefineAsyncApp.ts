import { isSSR } from "@lite-ssr/core/shared";
import { App } from "vue";

type AsyncAppFunction = (payload?: Record<string, any>) => App | Promise<App>;

/**
 * Defines an asynchronous application-level function that only executes on the client-side.
 *
 * This utility allows you to specify a function that will not run during server-side rendering (SSR),
 * ensuring that certain logic, such as DOM manipulation or client-specific operations, 
 * is only executed in the browser environment.
 *
 * @param fn - The function to be executed on the client-side.
 * @returns The provided function, allowing for further chaining or reuse.
 *
 * @example
 * // Define a client-only initialization logic
 * defineAsyncApp(async () => {
 *   const app = createApp(App);
 *   return app;
 * });
 */
export function defineAsyncApp(fn: AsyncAppFunction): Function {
    // Check if the current environment is not SSR
    if (!isSSR()) {
        const { _pl } = JSON.parse(window.__INITIAL_STATE__);
        fn(_pl); // Execute the function on the client
    }

    // Return the function for potential reuse or chaining
    return fn;
}
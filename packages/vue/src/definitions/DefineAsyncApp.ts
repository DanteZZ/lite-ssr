import { isSSR } from "@lite-ssr/core/shared";

export function defineAsyncApp(fn: Function) {
    if (!isSSR()) {
        fn();
    }
    return fn;
}
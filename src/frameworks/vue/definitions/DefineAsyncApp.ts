import { isSSR } from "../../../utils/IsSSR.js";

export function defineAsyncApp(fn: Function) {
    if (!isSSR()) {
        fn();
    }
    return fn;
}
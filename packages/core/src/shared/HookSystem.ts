import { logError } from "../utils/Logger.js";

// HookSystem больше не зависит от конкретных типов
export class HookSystem {
    private hooks: Map<string, Function[]> = new Map();

    // Функция для регистрации хука
    defineHook(hookName: string, handler: (params: any) => void | Promise<void>) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName)?.push(handler);
    }

    // Функция для выполнения хуков
    async dispatchHook(hookName: string, params: any) {
        const listeners = this.hooks.get(hookName);
        if (!listeners || listeners.length === 0) {
            return;
        }

        const results = await Promise.allSettled(
            listeners.map(listener => listener(params))
        );

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logError(`Обработчик на индексе ${index} для хука ${hookName} завершился с ошибкой:`)
                console.error(result.reason);
            }
        });
    }
}
import { logError, logInfo } from "../utils/Logger.js";

export interface Plugin<Context = any, Config = any> {
    name: string;
    initialize: (context: Context, config: Config) => void | Promise<void>;
    config: Config
}

export class PluginSystem<Context = any> {
    private plugins: Map<string, { plugin: Plugin<Context, any>; config: any }> = new Map();
    constructor(private context: Context) { }

    // Регистрация плагина с конфигурацией
    registerPlugin<Config = any>(plugin: Plugin<Context, Config>, config: Config) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Плагин с именем "${plugin.name}" уже зарегистрирован.`);
        }
        this.plugins.set(plugin.name, { plugin, config });
    }

    // Инициализация всех плагинов
    async initializePlugins() {
        for (const [name, { plugin, config }] of this.plugins.entries()) {
            try {
                logInfo(`Инициализация плагина: ${name}`)
                await plugin.initialize(this.context, config);
            } catch (error) {
                logError(`Ошибка при инициализации плагина "${name}":`)
                console.error(error);
            }
        }
    }

    // Получение зарегистрированного плагина (по имени)
    getPlugin(name: string): Plugin<Context, any> | undefined {
        return this.plugins.get(name)?.plugin;
    }

    // Получение конфигурации зарегистрированного плагина
    getPluginConfig(name: string): any | undefined {
        return this.plugins.get(name)?.config;
    }
}
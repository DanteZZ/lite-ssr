import { mergician } from "mergician";
import { LssrConfig } from "../types/LssrConfig.js";
import { compileTsToJs } from "./TSCompile.js";
import { filePathToUrl, resolve } from "./Path.js";
import { logError, logInfo, logSuccess } from "./Logger.js";
import { rmSync } from "fs";

const defaultConfig: Partial<LssrConfig> = {
    dist: "/dist",
    entry: "/src/main.ts",
    port: 3000,
};

export function defineLssrConfig(input: LssrConfig) {
    return mergician(defaultConfig, input) as LssrConfig;
};

export async function loadConfig(build: boolean = false, configPath: string = "/lssr.config.ts"): Promise<LssrConfig> {
    let currentPath = configPath;

    // Сборка файла конфигурации (если требуется)
    if (configPath.endsWith(".ts")) {
        currentPath = currentPath.substring(0, -3) + ".js";
        try {
            build && logInfo('Сборка файлов конфигурации...');
            await compileTsToJs(resolve(configPath), resolve(currentPath));
            build && logSuccess('Сборка файлов конфигурации завершена!');
        } catch (error) {
            logError('Сборка файлов конфигурации завершилась с ошибкой:');
            throw error;
        };
    }


    // Получение конфигурации
    try {
        logInfo("Загрузка конфигурации...");
        const config = (await import(/* @vite-ignore */ filePathToUrl(resolve(currentPath))))!.default as LssrConfig;
        if (configPath !== currentPath) rmSync(resolve(currentPath));
        return config;
    } catch (error) {
        logError('Загрузка файлов конфигурации завершилась с ошибкой:');
        throw error;
    }


}
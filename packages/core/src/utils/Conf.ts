import { mergician } from "mergician";
import { LssrConfig } from "../types/LssrConfig.js";
import { compileTsToJs } from "./TSCompile.js";
import { filePathToUrl, resolve } from "./Path.js";
import { logError, logInfo, logSuccess } from "./Logger.js";
import { existsSync, rmSync } from "fs";

const defaultConfig: Partial<LssrConfig> = {
    dist: "/dist",
    entry: "/src/main",
    port: 3000,
};

export function defineLssrConfig(input: LssrConfig) {
    return mergician(defaultConfig, input) as LssrConfig;
};

export async function loadConfig(build: boolean = false, configPath: string = "/lssr.config"): Promise<LssrConfig> {
    let currentPath: string = configPath;

    let isTs = configPath.endsWith("ts");
    let isJs = configPath.endsWith("js");

    let hasExtension = !!(isTs || isJs);

    let isExist: boolean = false;

    if (existsSync(resolve(configPath + (hasExtension ? "" : ".ts")))) {
        isTs = true;
        currentPath = configPath + (hasExtension ? "" : ".ts")
        isExist = true;
        console.log(currentPath);
    } else if (existsSync(resolve(configPath + (hasExtension ? " " : ".js")))) {
        isJs = true;
        currentPath = configPath + (hasExtension ? "" : ".js")
        isExist = true;
    }

    if (!isExist) {
        throw `Не удалось найти файл конфигурации LiteSSR`;
    }

    // Сборка файла конфигурации (если требуется)
    if (isTs) {
        currentPath = currentPath.substring(0, currentPath.length - 3) + ".js";
        try {
            build && logInfo('Сборка файлов конфигурации...');
            await compileTsToJs(resolve(configPath + (hasExtension ? "" : ".ts")), resolve(currentPath));
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
        if (!config.entry) {
            config.entry = defaultConfig.entry + (isTs ? ".ts" : ".js")
        }
        if (isTs) rmSync(resolve(currentPath));
        return config;
    } catch (error) {
        logError('Загрузка файлов конфигурации завершилась с ошибкой:');
        throw error;
    }
}
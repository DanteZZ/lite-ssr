import path from "path";
import { LssrConfig } from "../types/LssrConfig.js";
import { Framework } from "../types/Framework.js";
import { build } from "vite";
import { logError, logInfo, logSuccess } from "../utils/Logger.js";
import { fileURLToPath } from "url";
import { compileTsToJs } from "../utils/TSCompile.js";
import { readFileSync, rmSync, writeFileSync } from "fs";

export class Builder {
    config: LssrConfig = {}
    framework: Framework
    distPath = ""

    constructor(framework: Framework) {
        this.framework = framework;
    }
    async initialize() {
        await this.buildConfig();
        this.config = await this.loadConfig();
        this.distPath = this.resolve(this.config.dist as string);
    }

    async buildConfig() {
        logInfo('Сборка файлов конфигурации...');
        try {
            await compileTsToJs(this.resolve("/lssr.config.ts"), this.resolve("/lssr.config.js"));
            logSuccess('Сборка файлов конфигурации завершена!');
        } catch (error) {
            logError('Сборка файлов конфигурации завершилась с ошибкой:');
            throw error;
        }
    }

    async loadConfig() {
        logInfo("Загрузка конфигурации");
        const config = (await import(this.filePathToUrl(this.resolve("/lssr.config.js"))))!.default as LssrConfig;
        rmSync(this.resolve("/lssr.config.js"));
        return config;
    }

    filePathToUrl(path: string) {
        return `file://${path.replace(/\\/g, '/')}`
    }

    resolve(p: string): string {
        return path.resolve(path.join(process.cwd(), p))
    }

    async buildClientApp() {
        logInfo("Сборка клиентского приложения");
        try {
            // Указываем конфигурацию для сборки
            const result = await build({
                build: {
                    outDir: path.join(this.distPath, '/client'), // Папка для вывода
                    ssrManifest: true,
                    rollupOptions: {
                        input: {
                            main: this.resolve(this.config.entry as string),
                        },
                        output: {
                            name: "entry.js"
                        }
                    }
                }
            });

            logInfo("Сборка index.html файла...")
            let htmlPath = this.config?.html ?
                this.resolve(this.config?.html) :
                path.resolve(
                    path.dirname(fileURLToPath(import.meta.url)),
                    "../../index.html"
                );
            console.log(htmlPath);
            let html = readFileSync(htmlPath, "utf-8");
            const scripts: string[] = [];
            const styles: string[] = [];

            (result as any).output.forEach((resFile: any) => {
                const file: string = resFile.fileName;
                console.log(file);
                if (file.endsWith(".js")) {
                    scripts.push(file)
                } else if (file.endsWith(".css")) {
                    styles.push(file)
                };
            });

            html = html.replace('<!--entry-scripts-->', scripts.map(script => `<script type="module" src="/${script}"></script>`).join("\n") || "");
            html = html.replace('<!--entry-styles-->', styles.map(style => `<link href="/${style}" rel="stylesheet" />`).join("\n") || "");

            writeFileSync(path.join(this.distPath, "/index.html"), html, "utf-8");

            logSuccess('Сборка клиентского приложения завершена!');
        } catch (error) {
            logError('Сборка клиентского приложения завершилось с ошибкой:');
            console.error(error);
        }
    }

    async buildServerApp() {
        logInfo("Сборка серверного приложения");
        try {
            // Указываем конфигурацию для сборки
            await build({
                build: {
                    outDir: path.join(this.distPath, '/ssr'), // Папка для вывода
                    ssr: true,
                    rollupOptions: {
                        input: {
                            main: this.resolve(this.config.entry as string),
                        },
                        output: {
                            entryFileNames: `app.js`
                        }
                    }
                }
            });
            logSuccess('Сборка серверного приложения завершена!');
        } catch (error) {
            logError('Сборка серверного приложения завершилось с ошибкой:');
            console.error(error);
        }
    }

}
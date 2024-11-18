import path from "path";
import { filePathToUrl, LssrConfig, resolve } from "@lite-ssr/core";
import { build } from "vite";
import { logError, logInfo, logSuccess } from "@lite-ssr/core";
import { fileURLToPath } from "url";
import { readFileSync, rmSync, writeFileSync } from "fs";

export class Builder {
    config: LssrConfig;
    distPath = ""

    constructor(config: LssrConfig) {
        this.config = config;
        this.distPath = this.resolve(this.config.dist as string);
    }

    filePathToUrl(path: string) {
        return filePathToUrl(path);
    }

    resolve(path: string) {
        return resolve(path);
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
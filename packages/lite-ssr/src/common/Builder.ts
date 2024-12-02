import path from "path";
import { filePathToUrl, LssrConfig, resolve } from "@lite-ssr/core";
import { build } from "vite";
import { logError, logInfo, logSuccess } from "@lite-ssr/core";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { readFile } from "fs/promises";

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

    async buildHtml() {
        let htmlPath: string;
        if (this.config?.html) {
            htmlPath = this.resolve(this.config?.html);
        } else {
            const rendererTemplate = (await (this.config.renderer as any).getHtmlTemplate()) as string | null;
            if (rendererTemplate) return rendererTemplate;
            htmlPath = path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                "../../index.html"
            );
        }
        return await readFile(
            htmlPath,
            "utf-8"
        );

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
            let html = await this.buildHtml();

            const scripts: string[] = [];
            const styles: string[] = [];

            (result as any).output.forEach((resFile: any) => {
                const file = resFile;
                if (file.fileName.endsWith(".js") && !file.isDynamicEntry) {
                    scripts.push(file.fileName);
                }
                else if (file.fileName.endsWith(".css") && !file.isDynamicEntry) {
                    styles.push(file.fileName);
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
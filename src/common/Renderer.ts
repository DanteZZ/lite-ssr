import { SSRHeadPayload } from "@unhead/ssr";
import { HeadConfig } from "../types/ViteConfig.js";
import { Manifest } from "./ManifestUtils.js";
import { FinalContext } from "../types/Context.js";
import { getPreloadLinks } from "./PreloadUtils.js";


export abstract class Renderer {

    protected entryPoint: string;
    protected headConfig: HeadConfig | undefined = undefined;
    protected manifest: Manifest | null = null;

    constructor(
        entryPoint: string,
        headConfig: HeadConfig | undefined,
        manifest: Manifest | null
    ) {
        this.entryPoint = entryPoint;
        this.headConfig = headConfig;
        this.manifest = manifest;
    }

    // Абстрактные методы, которые должны быть реализованы в подклассах
    abstract renderApp(): Promise<string>;
    abstract renderHead(): Promise<SSRHeadPayload>;
    renderPreloadLinks(modules: string[]): string {
        return getPreloadLinks(modules, this.manifest);
    };
    // Метод для получения контекста
    abstract getContext(): FinalContext
}
import { SSRHeadPayload } from "@unhead/ssr";
import { HeadConfig } from "../types/ViteConfig.js";
import { Manifest } from "./ManifestUtils.js";
import { FinalContext } from "../types/Context.js";


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
    abstract renderPreloadLinks(modules: string[]): string;

    // Метод для получения контекста
    abstract getContext(): FinalContext
}
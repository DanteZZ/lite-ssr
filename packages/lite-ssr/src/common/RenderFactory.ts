import { Renderer, RenderCreator, LssrConfig } from '@lite-ssr/core';

interface IRendererConfig {
    entryPoint: string,
    manifest: any,
    config: LssrConfig,
}

export class RendererFactory {
    static async createRenderer(renderClass: RenderCreator, config: IRendererConfig, load: Function): Promise<Renderer> {
        let renderer: Renderer;
        try {
            renderer = new renderClass(config.entryPoint, config.config, config.manifest, load);
        } catch (e) {
            console.error(e);
            throw `Не удалось инициализировать Renderer, проверьте файл конфигурации lssr.`;
        };

        return renderer;
    }
}
import { Renderer } from './Renderer.js';
import { VueRenderer } from '../frameworks/vue/VueRenderer.js';
import { HeadConfig } from '../types/LssrConfig.js';
import { Framework } from '../types/Framework.js';

interface IRendererConfig {
    entryPoint: string,
    headConfig?: HeadConfig,
    manifest: any
}

export class RendererFactory {
    static createRenderer(framework: Framework, config: IRendererConfig): Renderer {
        let renderer: Renderer;

        // TODO: Добавить react
        if (framework === Framework.vue) {
            renderer = new VueRenderer(config.entryPoint, config.headConfig, config.manifest);
        } else {
            throw new Error('Unsupported framework');
        }
        return renderer;
    }
}
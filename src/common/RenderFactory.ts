import { Renderer } from './Renderer.js';
import { VueRenderer } from '../frameworks/vue/VueRenderer.js';
import { HeadConfig } from '../types/ViteConfig.js';

interface IRendererConfig {
    entryPoint: string,
    headConfig?: HeadConfig,
    manifest: any
}

export class RendererFactory {
    static createRenderer(framework: 'vue', config: IRendererConfig): Renderer {
        let renderer: Renderer;
        if (framework === 'vue') {
            renderer = new VueRenderer(config.entryPoint, config.headConfig, config.manifest);
        } else {
            throw new Error('Unsupported framework');
        }
        return renderer;
    }
}
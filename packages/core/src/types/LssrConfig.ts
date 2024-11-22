import { Renderer } from "../common/Renderer.js";
import { Plugin } from "../shared/PluginSystem.js";

export type RenderCreator = new (...args: any[]) => Renderer;

export interface LssrConfig {
    dist?: string
    entry?: string
    renderer: RenderCreator
    plugins?: Plugin[]
    rendererPlugins?: Plugin[]
    html?: string
    port?: number
}


import { Renderer } from "../common/Renderer.js";

export type RenderCreator = new (...args: any[]) => Renderer;

export interface LssrConfig {
    dist?: string
    entry?: string
    renderer: RenderCreator
    html?: string
    port?: number
}


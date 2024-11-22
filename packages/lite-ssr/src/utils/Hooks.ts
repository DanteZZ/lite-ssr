
import { LssrConfig, RenderCreator, Renderer } from "@lite-ssr/core";
import { HookSystem } from "@lite-ssr/core/shared";

import { Express, Response, Request } from "express";

interface ServerHook {
    $app: Express,
    $config: LssrConfig,
    $entry: string,
    $renderCreator: RenderCreator
}

interface ServerHookRequest {
    $app: Express,
    $config: LssrConfig,
    $entry: string,
    $renderer: Renderer,
    url: string,
    req: Request,
    res: Response
}

interface ServerHookTypes {
    'afterInitializePlugins': ServerHook;
    'beforeMiddlewares': ServerHook;
    'afterMiddlewares': ServerHook;
    'request': ServerHookRequest;
    'renderStart': ServerHookRequest;
    'renderEnd': ServerHookRequest;
    'beforeResponse': ServerHookRequest;
    'afterResponse': ServerHookRequest;
}

const serverHookSystem = new HookSystem();


export function defineServerHook<K extends keyof ServerHookTypes>(
    hookName: K,
    handler: (params: ServerHookTypes[K]) => void | Promise<void>
) {
    serverHookSystem.defineHook(hookName, handler);
}

export async function dispatchServerHook<K extends keyof ServerHookTypes>(
    hookName: K,
    params: ServerHookTypes[K]
) {
    await serverHookSystem.dispatchHook(hookName, params);
}
import { ServerRenderer } from "./common/ServerRenderer.js";

const runDev = async () => {
    const server = new ServerRenderer('vue');
    await server.initialize();
    server.run();
}

runDev();

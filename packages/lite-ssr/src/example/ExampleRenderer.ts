import { Renderer } from "@lite-ssr/core";

export default class ExampleRenderer extends Renderer {
    async renderApp(url: string) {
        console.log("RenderUrl:", url);
        console.log("Entry:", this.entryPoint);
        return `<h1>Example Ssr Render</h1><h2>URL: ${url}</h2>`;
    }

    getInitialState() {
        return {};
    }
}
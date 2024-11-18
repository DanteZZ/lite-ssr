import { defineLssrConfig } from "./dist/index.js";
import ExampleRenderer from "./dist/example/ExampleRenderer.js";

export default defineLssrConfig({
    renderer: ExampleRenderer,
    dist: "/dist-example",
    entry: "/src/example/entry.ts",
});
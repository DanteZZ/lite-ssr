import { defineLssrConfig, LssrConfig } from "./dist/index.js";

const config: LssrConfig = {
    dist: "/dist-example",
    entry: "/src/_example/main.ts"
}

export default defineLssrConfig(config);
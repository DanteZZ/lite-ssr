import { mergician } from "mergician";
import { LssrConfig } from "../types/LssrConfig.js";

const defaultConfig: LssrConfig = {
    dist: "/dist",
    entry: "/src/main.ts",
    port: 3000,
    head: {},
};

export function defineLssrConfig(input: LssrConfig) {
    return mergician(defaultConfig, input) as LssrConfig;
};
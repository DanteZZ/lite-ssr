import { mergician } from "mergician";
import { LssrConfig } from "../types/LssrConfig.js";

const defaultConfig: LssrConfig = {
    dist: "/dist",
    entry: "/src/main.ts",
    head: {},
};

export function defineLssrConfig(input: LssrConfig) {
    return mergician(defaultConfig, input) as LssrConfig;
};
/// <reference types="vite/client" />

interface ImportMetaEnv {
    SSR: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
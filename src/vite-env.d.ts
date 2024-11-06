/// <reference types="vite/client" />

interface ImportMetaEnv {
    SSR: boolean; // Добавьте эту строку
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
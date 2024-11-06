import { defineConfig } from 'vite';
import { lssrVite } from './dist/utils/vite'; // Ваш плагин

export default defineConfig({
    plugins: [
        lssrVite({
            entry: "/src/entrypoint.ts"
        }),
    ],
    server: {
        port: 1337
    }
});
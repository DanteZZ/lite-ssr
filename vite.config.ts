import { defineConfig } from 'vite';
import { lssrVite } from './dist/vite/export'; // Ваш плагин

export default defineConfig({
    plugins: [
        lssrVite({
            entry: "/src/example/main.ts"
        }),
    ],
    server: {
        port: 3000
    }
});
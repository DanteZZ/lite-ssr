import { defineConfig } from 'vite';
import { lssrVite } from './dist'; // Ваш плагин

export default defineConfig({
    plugins: [
        lssrVite({
            entry: "/src/_example/main.ts"
        }),
    ],
    server: {
        port: 3000
    }
});
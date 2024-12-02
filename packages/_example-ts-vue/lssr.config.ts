import { defineLssrConfig } from "lite-ssr";
import { VueRenderer } from "@lite-ssr/vue/renderer";
import proxyPlugin from "@lite-ssr/proxy";
import vueUnheadPlugin from "@lite-ssr/vue-unhead";
import { vueCachedDataPlugin } from "@lite-ssr/cached-data/plugin-vue";

export default defineLssrConfig({
    renderer: VueRenderer,
    port: 2000,
    plugins: [
        proxyPlugin({
            '/api': {
                target: 'https://jsonplaceholder.typicode.com',
                changeOrigin: true,
                pathRewrite: {
                    '/api/todos': '/todos',
                    '/api/users': '/users'
                },
            }
        })
    ],
    rendererPlugins: [
        vueUnheadPlugin({
            title: "Aboba333"
        }),
        vueCachedDataPlugin([
            {
                name: "cached-todo",
                fetcher: async () => {
                    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/3`);
                    return await response.json();
                },
                refreshInterval: 5000
            }
        ])
    ]
});
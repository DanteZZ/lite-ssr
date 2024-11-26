import { defineLssrConfig } from "lite-ssr";
import { VueRenderer } from "@lite-ssr/vue/renderer";
import proxyPlugin from "@lite-ssr/proxy";
import vueUnheadPlugin from "@lite-ssr/vue-unhead";

export default defineLssrConfig({
    renderer: VueRenderer,
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
        })
    ]
});
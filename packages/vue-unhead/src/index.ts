import { definePlugin } from "@lite-ssr/vue/renderer";
import { renderSSRHead } from '@unhead/ssr';
import { createHead, Head } from "@unhead/vue";

export const vueUnheadPlugin = definePlugin<Head>('vue-unhead', ({ defineHook }, config) => {
    defineHook('init', ({ $app }) => {
        const head = createHead();
        $app.use(head);
        head.push(config);
    });
    defineHook('beforeFillHtml', ({ $renderer }) => {
        $renderer.html = $renderer.html
            .replace("<html", "<html<!--htmlAttrs--> ")
            .replace("<head>", "<head>\n<!--headTags--> ")
            .replace("<body", "<body<!--bodyAttrs-->")
            // TODO: Добавить сюда bodyTagsOpen
            .replace("</body>", "<!--bodyTags-->\n</body>")
    })

    defineHook('fillHtml', async ({ $app, $renderer }) => {
        const payload = await renderSSRHead($app.config.globalProperties!.$head);
        let h = $renderer.html;
        Object.entries(payload).forEach(([key, value]) => {
            h = h.replace(`<!--${key}-->`, value as string)
        })
        $renderer.html = h;
    })
})

export default vueUnheadPlugin;
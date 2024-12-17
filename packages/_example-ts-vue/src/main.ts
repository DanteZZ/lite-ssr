import './style.css'
import App from './App.vue'
import { createApp, defineAsyncApp } from '@lite-ssr/vue';



export default defineAsyncApp((payload) => {
    console.log('[PAYLOAD]', payload);
    const app = createApp(App);
    app.mount("#app");
    return app;
});

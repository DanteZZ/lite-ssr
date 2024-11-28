import './style.css'
import App from './App.vue'
import { createApp } from '@lite-ssr/vue';

const app = createApp(App);
app.mount("#app");

export default app;

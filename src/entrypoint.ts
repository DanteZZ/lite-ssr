import { defineComponent } from 'vue';
import { createSSRApp } from './utils/vue/createSSRApp.js';
// Определяем компонент App
const App = defineComponent({
  template: `
    <div>
      <h1>Привет, Vue + Less!</h1>
      <p>Всё работает, с чем вас и поздравляю!.</p>
    </div>
  `
});

// Создаем экземпляр приложения
const app = createSSRApp(App);

// Монтируем приложение в элемент с id "app"
app.mount('#app');

export default app;
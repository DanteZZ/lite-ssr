import { defineComponent, h, ref } from 'vue';
import { createSSRApp } from '../utils/vue/createSSRApp.js';
import { definePrefetchStore } from '../utils/vue/definePrefetchStore.js';
import { useAsyncData } from '../utils/vue/useAsyncData.js';

const App = defineComponent({
    async setup() {

        const useTodoStore = definePrefetchStore('todos', () => {
            const todo = ref<null | any>(null);

            const fetchTodo = async (id: number) => {
                const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                todo.value = await response.json();
            };
            return {
                todo,
                fetchTodo
            }
        })

        const timer = ref(0);
        const { fetchTodo } = useTodoStore();
        await fetchTodo(1);

        const fetchTodoState = async (id: number) => {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            return response.json();
        }
        await useAsyncData(() => fetchTodoState(3));

        setInterval(() => {
            timer.value++;
            if (timer.value > 4) timer.value = 0;
        }, 500);
        return () => h('h1', 'Всё работает, с чем вас и поздравляю! ' + timer.value)
    }
});

const app = createSSRApp(App);
app.mount('#app');

export default app;
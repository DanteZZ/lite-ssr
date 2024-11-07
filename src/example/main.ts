import { defineComponent, h, ref } from 'vue';
import { createSSRApp } from '../utils/vue/createSSRApp.js';
import { definePrefetchStore } from '../utils/vue/definePrefetchStore.js';

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


        const { fetchTodo, todo } = useTodoStore();
        await fetchTodo(1);
        await fetchTodo(2);
        const timer = ref(0);
        setInterval(() => {
            timer.value++;
            if (timer.value > 4) timer.value = 0;
        }, 500);
        return () => h('pre', JSON.stringify(todo.value, null, '\t'))
    },
});

const app = createSSRApp(App);
app.mount('#app');

export default app;
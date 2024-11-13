import { defineComponent, h, ref, watch } from 'vue';
import { createApp } from '../frameworks/vue/export.js'
import { definePrefetchStore } from '../frameworks/vue/export.js';

const App = defineComponent({
    setup() {
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


        // Выполняем запрос
        const { fetchTodo, todo } = useTodoStore();

        fetchTodo(1);

        const timer = ref(0);
        setInterval(() => {
            timer.value++;
            if (timer.value > 4) timer.value = 0;
        }, 500);


        return () => h('pre', JSON.stringify(todo.value, null, '\t'))
    },
});

const app = createApp(App);
app.mount('#app');

export default app;
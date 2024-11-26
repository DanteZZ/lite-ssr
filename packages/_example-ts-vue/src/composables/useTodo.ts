import { ref } from "vue";
import { definePrefetchStore } from "@lite-ssr/vue";

export const useTodo = definePrefetchStore('todo', () => {
    // Инициализация состояний
    const todo = ref<null | any>(null);
    const loading = ref<boolean>(false);
    const error = ref<boolean>(false);

    // Инициализация асинхронных функций
    const fetchTodo = async (id: number) => {
        loading.value = true;

        const response = await fetch(`http://localhost:3000/api/todos/${id}`);

        if (response.ok) {
            todo.value = await response.json();
        } else {
            todo.value = null;
            error.value = true;
        }

        loading.value = false;
    };

    // Возвращаем состояния и функции
    return {
        todo,
        loading,
        error,
        fetchTodo
    }
})
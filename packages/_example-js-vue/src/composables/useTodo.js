import { ref } from "vue";
import { definePrefetchStore } from "@lite-ssr/vue";
import { axiosApi, ofetchApi } from "../api";

export const useTodo = definePrefetchStore('todo', () => {
    // Инициализация состояний
    const todo = ref(null);
    const loading = ref(false);
    const error = ref(false);

    // Инициализация асинхронных функций
    const fetchTodo = async (id) => {
        loading.value = true;

        // const response = await fetch(`http://localhost:3000/api/todos/${id}`);
        try {
            // const res = await ofetchApi(`/todos/${id}`);
            const { data: res } = await axiosApi.get(`/todos/${id}`);
            todo.value = res;
        } catch (e) {
            todo.value = null;
            error.value = true;
        }
    };

    // Возвращаем состояния и функции
    return {
        todo,
        loading,
        error,
        fetchTodo
    }
})
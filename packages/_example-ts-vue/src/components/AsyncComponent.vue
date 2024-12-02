<script setup lang="ts">
import { useAsyncData } from '@lite-ssr/vue';
import { useTodo } from '../composables/useTodo';
import { useHead } from '@unhead/vue';
import { axiosApi } from '../api';
import { useCachedData } from "@lite-ssr/cached-data/vue";

const { todo, fetchTodo } = useTodo();

const { data: todoData } = await useAsyncData('abobus', async () => {
    const { data } = await axiosApi.get("/todos/1");
    return data;
});

const cachedTodo = useCachedData('cached-todo');

await fetchTodo(1);

useHead({
    title: () => todo.value?.title
});

</script>

<template>
    <div style="text-align:left">
        <h2>useAsyncData</h2>
        <pre>{{ JSON.stringify(todoData, null, '\t') }}</pre>
        <h2>definePrefetchStore</h2>
        <pre>{{ JSON.stringify(todo, null, '\t') }}</pre>
        <h2>useCachedData</h2>
        <pre>{{ JSON.stringify(cachedTodo, null, '\t') }}</pre>
    </div>
</template>

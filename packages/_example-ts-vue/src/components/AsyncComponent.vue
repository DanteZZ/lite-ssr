<script setup lang="ts">
import { useAsyncData } from '@lite-ssr/vue';
// import { useTodo } from '../composables/useTodo';
import { useHead } from '@unhead/vue';
import { axiosApi } from '../api';

const { data: todo } = await useAsyncData('abobus', async () => {
    const { data } = await axiosApi.get("/todos/1");
    return data;
});

// fetchTodo(1);
console.log(todo.value);

useHead({
    title: () => todo.value?.title
});

</script>

<template>
    <pre>{{ JSON.stringify(todo, null, '\t') }}</pre>
</template>

<script setup>
import { useTodo } from '../composables/useTodo';
import { useHead } from '@unhead/vue';

const { todo, fetchTodo } = useTodo();

fetchTodo(1);

useHead({
    title: () => todo.value?.title
});

</script>

<template>
    <pre>{{ JSON.stringify(todo, null, '\t') }}</pre>
</template>

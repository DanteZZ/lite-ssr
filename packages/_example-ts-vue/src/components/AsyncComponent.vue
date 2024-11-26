<script setup lang="ts">
import { useTodo } from '../composables/useTodo';

const { todo, fetchTodo } = useTodo();

await fetchTodo(1);
</script>

<template>
    <pre>{{ JSON.stringify(todo, null, '\t') }}</pre>
</template>

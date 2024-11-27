<script setup lang="ts">
import { ref } from 'vue';
import { useTodo } from '../composables/useTodo';

const { todo, fetchTodo } = useTodo();
const todoId = ref(10);
</script>

<template>
    <pre>{{ JSON.stringify(todo, null, '\t') }}</pre>
    <button @click="() => { todoId++; fetchTodo(todoId) }">Update++</button>
</template>

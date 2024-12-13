<script setup lang="ts">
import { useAsyncData, useCookies } from "@lite-ssr/vue";
import { useTodo } from "../composables/useTodo";
import { useHead } from "@unhead/vue";
import { axiosApi } from "../api";
import { useCachedData } from "@lite-ssr/cached-data/vue";
import { onMounted } from "vue";

const cookies = useCookies();

const { todo, fetchTodo } = useTodo();

const { data: todoData } = await useAsyncData("abobus", async () => {
  const { data } = await axiosApi.get("/todos/1");
  return data;
});

const cachedTodo = useCachedData("cached-todo");

await fetchTodo(1);

useHead({
  title: () => todo.value?.title,
});

if (import.meta.env.SSR) {
  cookies.set("test", "someSSRValue", {
    path: "/",
    secure: false,
  });
}

onMounted(() => {
  cookies.set("counter", "0");
  setInterval(() => {
    cookies.set("counter", (Number(cookies.get("counter")) + 1).toString());
  }, 1000);
});
</script>

<template>
  <div style="text-align: left">
    <h2>useAsyncData</h2>
    <pre>{{ JSON.stringify(todoData, null, "\t") }}</pre>
    <h2>definePrefetchStore</h2>
    <pre>{{ JSON.stringify(todo, null, "\t") }}</pre>
    <h2>useCachedData</h2>
    <pre>{{ JSON.stringify(cachedTodo, null, "\t") }}</pre>
    <h3>Cookies</h3>
    <pre>{{ JSON.stringify(cookies.getAll(), null, "\t") }}</pre>
  </div>
</template>

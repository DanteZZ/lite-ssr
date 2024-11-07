<div align='center'>
    <h1><b>LITE-SSR</b></h1>
    <!-- <img src='' width='250' height='250' /> -->
    <p>Легковесная реализация SSR для Vite.</p>

![TypeScript](https://badgen.net/badge/TypeScript/5.3.3/blue?)
![Node.js](https://badgen.net/badge/Node.js/20.17.0/green?)
![Vue](https://badgen.net/badge/Vue/3.5.12/cyan?)
![Next.js](https://badgen.net/badge/Vite/5.4.10/black?)

</div>

---

## 💾 **О проекте**

Данная библиотека разработана для организации SSR в Vite/Vue3 проектах, с минимальными требованиями по архитектуре.

Зачем это нужно?

- Для разработки проектов без ограничений по правилам оформления роутинга, иерархии компонентов и других "палок" в колёсах от других известных реализаций SSR
- Предоставление удобных методов (composables) для префетча данных на стороне сервера

>**Основная цель проекта:** не навязывать собственную архитектуру разработки SSR проекта, а лишь служить удобным дополнением к проектам разработанным на Vite

<br />

---

## 🗒️ **УСТАНОВКА**

### local installation:

1. Установка библиотеки

```bash
pnpm i lite-ssr
```

2. Заменяем `createApp` на `createSSRApp` из ite-ssr

```ts
import { createSSRApp } from 'lite-ssr'
import './style.css'
import App from './App.vue'

createSSRApp(App).mount('#app')
```

3. Подключение плагина для vite, в `vite.config.ts`

``` ts
import { defineConfig } from 'vite';
import { lssrVite } from 'lite-ssr';

export default defineConfig({
    plugins: [
        lssrVite({
            entry: "/src/main.ts" // Опционально
        }),
    ],
    server: {
        port: 3000 // Опционально
    }
});
```

4. Меняем команды запуска и сборки в `package.json`

```json
{
    ...
    "scripts": {
        "dev": "lssr",
        "build": "lssr build", // Ещё не реализовано
        ...
    },
    ...
}
```

<br />

### Запуск проекта:

Запуск в dev режиме:

```bash
pnpm run dev
```

Сборка проекта:

```bash
pnpm run build # Не реализовано
```

<br />

---

## 🔎 **ИСПОЛЬЗОВАНИЕ**

### Конфигурация vite плагина
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { lssrVite } from "lite-ssr/dist/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    lssrVite({
      entrypoint?: "/src/main.ts" // Опционально, путь к файлу инициализации приложения
      head?: { // Опционально, конфигурация unhead (https://unhead.unjs.io/usage/composables/use-head#input)
        title: ""
      }
    })
  ],
})
```

### Создание асинхронных сторов
> Для организации получения данных на стороне сервера и клиента, библиотека предоставляет возможность создавать префетч-сторы, для упрощения работы с асинхронными запросами

Пример создания стора:
```typescript
// useData.ts
import { ref } from "vue";
import { definePrefetchStore } from "lite-ssr";

export const useData = definePrefetchStore('data', () => {
    // Инициализация стейтов
    const data = ref<null | any>(null);
    const loading = ref<boolean>(false);
    const error = ref<boolean>(false);

    // Инициализация асинхроных функций
    const fetchData = async (id: number) => {
        loading.value = true;

        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
        
        if (response.ok) {
            data.value = await response.json();
        } else {
            data.value = null;
            error.value = true;
        }

        loading.value = false;
    };

    // Возвращаем стейты и функции
    return {
        data,
        loading,
        error,
        fetchData
    }
})
```

**! ВАЖНАЯ ИНФОРМАЦИЯ !**
> Префетч-сторы, как и сторы Pinia требуют уникального наименования. Это нужно для правильно передачи информации полученной на стороне SSR клиенту !

Пример использования получившегося стора:
```html
<!--App.vue-->
<template>
    <div>
        <span v-if="loading">Загрузка данных...</span>
        <span v-else-if="error">Не удалось загрузить данные</span>
        <pre v-else>{{ serializedData }}</pre>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted } from 'vue'
    import { useData } from "./useData";

    // Подключаем наш стор
    const { fetchData, data, loading, error } = useData(); 

    // Сериализуем данные для удобочитаемости
    const serializedData = computed( 
        () => data ? JSON.stringify(data, null, '\t') : ''
    )

    // Получаем данные при монтировании компонента
    onMounted(() => fetchData(1))
</script>
```
<br />

---
### Префетч данных внутри компонента через useAsyncData (ОСУЖДАЕМ!)
> Библиотека так же предоставляет собственную альтернативу **useAsyncData** из Nuxt. Но мы настоятельно рекомендуем не использовать его, по причине низкой производительности

```html
<!--App.vue-->
<template>
    <div>
        <span v-if="loading">Загрузка данных...</span>
        <span v-else-if="error">Не удалось загрузить данные</span>
        <pre v-else>{{ serializedData }}</pre>
    </div>
</template>

<script setup lang="ts">
    import { computed, defineProps } from 'vue'
    import { useAsyncData } from "lite-ssr";


    // Инициализируем асинхронный запрос
    const fetchTodo = async (id: number) => {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
        if (!response.ok) throw new Error();
        return response.json();
    };

    // Выполняем запрос
    const { data, loading, error } = useAsyncData('data', () => fetchTodo(1));

    // Сериализуем данные для удобочитаемости
    const serializedData = computed( 
        () => data ? JSON.stringify(data, null, '\t') : ''
    )
</script>
```

> Повторимся, мы крайне не рекомендуем использовать этот подход. Т.к. для отслеживания полученных значений функции требуется получать путь компонента, его пропсы и др. информацию для верной передачи этих данных на клиент. Вместо этого лучше используйте Префетч-сторы!
<br />

---

## 💻 **Технологии**

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)

---

<!-- ## 📌 **LINKS**

[<img alt="Github" src="https://img.shields.io/badge/[username]-%23181717.svg?style=for-the-badge&logo=github&logoColor=white" />](https://github.com/[username])
[<img alt="Twitter" src="https://img.shields.io/badge/[username]-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white" />](https://twitter.com/[username])
[<img alt="Instagram" src="https://img.shields.io/badge/[username]-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white" />](https://instagram.com/[username])
[<img alt="Youtube" src="https://img.shields.io/badge/[username]-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white" />](https://www.youtube.com/channel/[username])

[<img alt="Reddit" src="https://img.shields.io/badge/[username]-FF4500?style=for-the-badge&logo=reddit&logoColor=white" />](https://reddit.com/user/[username])
[<img alt="TikTok" src="https://img.shields.io/badge/[username]-%23000000.svg?style=for-the-badge&logo=TikTok&logoColor=white" />](https://www.tiktok.com/@[username])
[<img alt="Gitlab" src="https://img.shields.io/badge/[username]-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white" />](https://gitlab.com/[username])
[<img alt="Dribbble" src="https://img.shields.io/badge/[username]-EA4C89?style=for-the-badge&logo=dribbble&logoColor=white" />](https://dribbble.com/[username])

[<img alt="Stack Overflow" src="https://img.shields.io/badge/[username]-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white" />](https://stackoverflow.com/users/[usercode]/[username])
[<img alt="Discord" src="https://img.shields.io/badge/[username%23code]-%237289DA.svg?style=for-the-badge&logo=discord&logoColor=white" />]()
[<img alt="Steam" src="https://img.shields.io/badge/[username]-%23000000.svg?style=for-the-badge&logo=steam&logoColor=white" />](https://steamcommunity.com/id/[username])
[<img alt="Spotify" src="https://img.shields.io/badge/[username]-1ED760?style=for-the-badge&logo=spotify&logoColor=white" />](https://open.spotify.com/user/[username]) -->

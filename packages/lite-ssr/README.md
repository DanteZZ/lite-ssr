<div align='center'>
    <h1><b>LITE-SSR</b></h1>
    <!-- <img src='' width='250' height='250' /> -->
    <p>Легковесная реализация SSR для Vite.</p>

[Документация](http://lssr.dntz.xyz/)<br/></br>
![TypeScript](https://badgen.net/badge/TypeScript/5.3.3/blue?)
![Node.js](https://badgen.net/badge/Node.js/20.17.0/green?)
![Vue](https://badgen.net/badge/Vue/3.5.12/cyan?)
![Next.js](https://badgen.net/badge/Vite/5.4.10/black?)

</div>

---

## 💾 **О проекте**

Данная библиотека разработана для организации SSR в Vite проектах, с минимальными требованиями по архитектуре.

Зачем это нужно?

- Для разработки проектов без ограничений по правилам оформления роутинга, иерархии компонентов и других "палок" в колёсах от других известных реализаций SSR
- Предоставление удобного API для разработки своих реализаций ssr
- Удобной сборки проектов

>**Основная цель проекта:** не навязывать собственную архитектуру разработки SSR проекта, а лишь служить удобным дополнением к проектам разработанным на Vite

<br />

---

## 🗒️ **УСТАНОВКА**

1. Установка библиотеки:
```bash
pnpm i lite-ssr
```

2. Создание файла конфигурации `/lssr.config.ts`

``` ts
// lssr.config.ts
import { SomeRenderer } from "..." // Необходимый рендерер
import { defineLssrConfig } from "lite-ssr";

export default defineLssrConfig({
    renderer: SomeRenderer
    entry: "/src/main.ts",
});
```

4. Добавляем файл конфигурации в`tsconfig.node.json`

```json
// tsconfig.node.json
{
  "include": ["lssr.config.ts"]
}

```

5. Меняем команды запуска и сборки в `package.json`

```json
{
    "scripts": {
        "dev": "lssr",
        "build": "lssr --build",
        "serve": "lssr --serve",
    },
}
```

<br />

### Запуск проекта:
Запуск в dev-режиме:

```bash
pnpm run dev
```

Сборка проекта:

```bash
pnpm run build
```

Запуск проекта в production-режиме:

```bash
pnpm run serve
```

<br />

---

## 🔎 **ИСПОЛЬЗОВАНИЕ**

С полной документацией можно [ознакомиться здесь](http://lssr.dntz.xyz/)

---
## 💻 **Технологии**

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

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

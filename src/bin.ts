import { ServerRenderer } from "./common/ServerRenderer.js";
import { Framework } from "./types/Framework.js";

import { logInfo, logError } from './utils/Logger.js';
import { getFrameworkFromArgs, validateFramework } from './utils/Cli.js';


const run = async () => {
    try {
        // Получаем аргументы командной строки
        const { framework, buildFlag } = getFrameworkFromArgs();

        // Проверка валидности фреймворка
        const usedFramework = validateFramework(framework);

        // Логирование информации о фреймворке
        logInfo(`Запуск сервера разработки для фреймворка: ${framework}...`);


        if (!buildFlag) {
            // Запуск в режиме dev
            const server = new ServerRenderer(usedFramework);
            await server.initialize();
            server.run();

        } else {
            // Если передан флаг --build, запускаем сборку
            // TODO: Сделать сборку
            logError('LSSR ещё не имеет возможности работать в build режиме')
        }

    } catch (error) {
        if (error instanceof Error) {
            logError(error.message);
            console.error(error);
        } else {
            logError(error as string);
        }
    }
}

run();
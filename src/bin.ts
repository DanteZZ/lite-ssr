import { logInfo, logError } from './utils/Logger.js';
import { getFrameworkFromArgs, validateFramework } from './utils/Cli.js';
import { DevServer } from "./common/DevServer.js";
import { Builder } from './common/Builder.js';
import { Server } from './common/Server.js';


const run = async () => {
    try {
        // Получаем аргументы командной строки
        const { framework, buildFlag, serveFlag } = getFrameworkFromArgs();

        // Проверка валидности фреймворка
        const usedFramework = validateFramework(framework);

        // Логирование информации о фреймворке
        logInfo(`Запуск сервера разработки для фреймворка: ${framework}...`);

        if (buildFlag) {
            const builder = new Builder(usedFramework);
            await builder.initialize();
            await builder.buildClientApp();
            await builder.buildServerApp();
        } else if (serveFlag) {
            console.log("Serve");
            const server = new Server(usedFramework);
            await server.initialize();
            server.run();
        } else {
            // Запуск в режиме dev
            const server = new DevServer(usedFramework);
            await server.initialize();
            server.run();
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
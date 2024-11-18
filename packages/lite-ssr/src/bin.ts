import { logInfo, logError, loadConfig } from '@lite-ssr/core';
import { getArgs } from './utils/Cli.js';
import { DevServer } from "./common/DevServer.js";
import { Builder } from './common/Builder.js';
import { Server } from './common/Server.js';

const run = async () => {
    try {
        // Получаем аргументы командной строки
        const { buildFlag, serveFlag } = getArgs();
        // TODO: Сделать проверку на переданный renderer
        if (buildFlag) {
            const config = await loadConfig(true);
            const builder = new Builder(config);
            await builder.buildClientApp();
            await builder.buildServerApp();
        } else if (serveFlag) {
            const config = await loadConfig();
            logInfo(`Запуск production сервера...`);
            const server = new Server(config);
            await server.initialize();
            server.run();
        } else {
            const config = await loadConfig();
            logInfo(`Запуск сервера разработки...`);

            const server = new DevServer(config);
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
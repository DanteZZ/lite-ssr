import { Framework } from "../types/Framework.js";

export const getFrameworkFromArgs = () => {
    const args = process.argv.slice(2);
    const frameworkArg = args.find(arg => arg.startsWith('--framework='));
    const buildFlag = args.includes('--build');
    const serveFlag = args.includes('--serve');
    let framework = null;
    if (frameworkArg) {
        framework = frameworkArg.split('=')[1].toLowerCase();
    }

    return { framework, buildFlag, serveFlag };
};

export const validateFramework = (framework: string | null): Framework => {
    const validFrameworks = Object.keys(Framework);
    if (!framework || !validFrameworks.includes(framework)) {
        throw `Невалидный фреймворк "${framework}". Допустимые фреймворки: ${validFrameworks.join(', ')}`;
    }
    return framework as Framework
};
import chalk from 'chalk';

export const logSuccess = (message: string) => {
    console.log(chalk.green(message));
};

export const logInfo = (message: string) => {
    console.log(chalk.blue(message));
};

export const logWarning = (message: string) => {
    console.log(chalk.yellow(message));
};

export const logError = (message: string) => {
    console.log(chalk.red(message));
};
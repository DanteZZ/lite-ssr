import chalk from "chalk";

const lenAnsiString = (str: string) => {
    return str.replace(/\x1b\[[0-9;]*m/g, '').length;
};

function generateOwlFrame(first: string, second: string): string {
    const lF = lenAnsiString(first);
    const lS = lenAnsiString(second);
    const len = lF > lS ? lF : lS;
    const b = (s: string) => chalk.blue(s);
    const message = [
        b('.--') + `^ ^` + b('-'.repeat(len + 5)) + b('.'),
        b('|') + ` (O,O)  ` + first + b(' '.repeat(len - lenAnsiString(first) + 2) + '|'),
        b('|') + ` (   )  ` + second + b(' '.repeat(len - lenAnsiString(second) + 2) + '|'),
        `${b('\'--')}"${b('-')}"` + b('-'.repeat(len + 5)) + b("'")
    ]
    return message.join("\n")
}

export function showDevServerMessage(port: number | string) {
    console.log(generateOwlFrame(
        chalk.green('Сервер запущен'),
        chalk.cyan(`Приложение доступно по адресу: ${chalk.underline('http://localhost:' + port)}`),
    ));
}
import ts from 'typescript';
import fs from "fs";
import path from 'path';

// Функция для компиляции TypeScript в JavaScript
export function compileTsToJs(input: string, output: string) {
    const compilerOptions = {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        skipLibCheck: true,
        sourceMap: true,
    };

    const tsCode = fs.readFileSync(input, 'utf-8');
    const result = ts.transpileModule(tsCode, { compilerOptions });
    const jsFilePath = path.join(output);

    fs.writeFileSync(jsFilePath, result.outputText);
}
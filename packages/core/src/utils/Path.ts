import path from "path";

export const resolve = (p: string) => path.resolve(path.join(process.cwd(), p));
export const filePathToUrl = (p: string) => `file://${p.replace(/\\/g, '/')}`;
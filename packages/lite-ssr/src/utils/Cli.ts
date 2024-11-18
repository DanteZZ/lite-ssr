export const getArgs = () => {
    const args = process.argv.slice(2);
    const buildFlag = args.includes('--build');
    const serveFlag = args.includes('--serve');
    return { buildFlag, serveFlag };
};
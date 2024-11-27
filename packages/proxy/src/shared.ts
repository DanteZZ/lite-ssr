const requestSsrHandler = <T>(options: T): T => {
    const opts: any = options;
    if (typeof window === 'undefined') {
        if (opts.baseURL && !/^https?:\/\//i.test(opts.baseURL)) {
            const base = `http://localhost:${process.env.LSSR_PORT}`;
            opts.baseURL = `${base}${opts.baseURL}`;
        }
    }
    return opts as T;
}

const axiosSsrRequestResolver = <T>(opts: T): T => {
    return requestSsrHandler(opts);
}

const ofetchSsrRequestResolver = <T>(opts: T): void => {
    requestSsrHandler((opts as any).options);
}

export {
    axiosSsrRequestResolver,
    ofetchSsrRequestResolver
}
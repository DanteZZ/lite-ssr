interface CacheEntry {
    data: any;
    lastUpdated: number;
}

const cache: Record<string, CacheEntry> = {};

export const updateCache = async (name: string, fetcher: () => Promise<any>): Promise<void> => {
    try {
        const data = await fetcher();
        cache[name] = { data, lastUpdated: Date.now() };
    } catch (err) {
        console.error(`Failed to update cache for ${name}:`, err);
    }
};

export const getCache = (name: string): CacheEntry | undefined => cache[name];
export const getFullCache = (): Record<string, any> | undefined => Object.fromEntries(Object.entries(cache).map(([name, entry]) => [name, entry.data]));
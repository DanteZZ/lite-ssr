import { inject } from 'vue';
import { isSSR } from '@lite-ssr/core/shared';

export type CookieOptions = {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    expires?: Date;
};

type CookieEntry = {
    value: string;
    options?: CookieOptions;
};

/**
 * Parse document.cookie string into a key-value store
 */
function parseClientCookies(): Record<string, CookieEntry> {
    const parsed: Record<string, CookieEntry> = {};
    if (typeof document !== 'undefined') {
        document.cookie.split('; ').forEach((cookie) => {
            const [name, ...rest] = cookie.split('=');
            parsed[name] = { value: decodeURIComponent(rest.join('=')) };
        });
    }
    return parsed;
}

/**
 * Serialize a cookie into a string
 */
function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
    if (options.expires) cookieString += `; Expires=${options.expires.toUTCString()}`;
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.domain) cookieString += `; Domain=${options.domain}`;
    if (options.secure) cookieString += `; Secure`;
    if (options.httpOnly) cookieString += `; HttpOnly`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
    return cookieString;
}

/**
 * Hook to manage cookies
 */
export function useCookies() {
    // Initialize cookies store based on environment
    const cookiesStore: Record<string, CookieEntry> = isSSR()
        ? inject<Record<string, CookieEntry>>('__cookies', {}) || {}
        : parseClientCookies();

    return {
        /**
         * Get a cookie value
         */
        get(name: string): string | undefined {
            return (isSSR() ? cookiesStore : parseClientCookies())?.[name]?.value;
        },

        /**
         * Get a cookie value
         */
        getOptions(name: string): CookieOptions | undefined {
            return (isSSR() ? cookiesStore : parseClientCookies())?.[name]?.options;
        },

        /**
         * Get all cookies
         */
        getAll(): Record<string, CookieEntry> {
            return isSSR() ? cookiesStore : parseClientCookies();
        },

        /**
         * Set a cookie
         */
        set(name: string, value: string, options: CookieOptions = {}, merge: boolean = true): void {
            cookiesStore[name] = { value, options };

            if (!isSSR() && typeof document !== 'undefined') {
                document.cookie = serializeCookie(
                    name,
                    value,
                    merge ? { ...(this.getOptions(name) || {}), ...options }
                        : options
                );
            }
        },

        /**
         * Remove a cookie
         */
        remove(name: string): void {
            cookiesStore[name] = { value: '', options: { maxAge: -1 } };

            if (!isSSR() && typeof document !== 'undefined') {
                document.cookie = serializeCookie(name, '', { maxAge: -1 });
            }
        },
    };
}

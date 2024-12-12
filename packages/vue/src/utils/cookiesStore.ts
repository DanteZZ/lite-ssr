import { ref, inject } from 'vue';
import { isSSR } from '@lite-ssr/core/shared';

/**
 * Utility function to parse cookies from a cookie string.
 * @param cookieString - The cookie string from document.cookie.
 * @returns An object where the keys are cookie names and the values are cookie values.
 */
function parseCookies(cookieString: string): Record<string, string> {
    return cookieString.split('; ').reduce((cookies, cookie) => {
        const [name, ...value] = cookie.split('=');
        cookies[name] = decodeURIComponent(value.join('='));
        return cookies;
    }, {} as Record<string, string>);
}

/**
 * Utility function to serialize cookies into a string.
 * @param name - The name of the cookie.
 * @param value - The value of the cookie.
 * @param options - Additional options for setting the cookie (e.g., maxAge, path, etc.).
 * @returns A string that can be used in document.cookie.
 */
function serializeCookie(name: string, value: string, options: Record<string, any> = {}): string {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.secure) cookie += `; Secure`;
    if (options.httpOnly) cookie += `; HttpOnly`;
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    return cookie;
}

// Global object for storing cookies
const cookies = ref<Record<string, string>>({});

// Flag to track if polling is active
let pollingActive = false;

/**
 * Synchronizes cookies with document.cookie (client-side) or injected cookies (SSR).
 */
const syncCookies = () => {
    if (isSSR()) {
        // For SSR, cookies are passed via app.provide as __cookies
        const ssrCookies = inject<Record<string, string> | null>('__cookies', null);
        if (ssrCookies) {
            cookies.value = ssrCookies;
        }
    } else {
        // For client-side, we parse cookies from document.cookie
        const parsedCookies = parseCookies(document.cookie || '');
        if (JSON.stringify(parsedCookies) !== JSON.stringify(cookies.value)) {
            cookies.value = parsedCookies;
        }
    }
};

/**
 * Starts polling document.cookie for client-side, or listens for changes in SSR context.
 * Polling is only activated once.
 * 
 * @param pollInterval - The interval (in milliseconds) for polling cookies (defaults to 1000ms).
 */
const startPolling = (pollInterval: number) => {
    if (!pollingActive && !isSSR()) { // Only start polling on the client side
        pollingActive = true;
        setInterval(syncCookies, pollInterval);
    }
};

/**
 * Updates document.cookie when cookies are changed.
 * 
 * @param newCookies - The updated cookies to set in document.cookie.
 */
const updateCookies = (newCookies: Record<string, string>) => {
    if (!isSSR()) {
        Object.entries(newCookies).forEach(([name, value]) => {
            document.cookie = serializeCookie(name, value);
        });
    }
};

/**
 * Custom hook for managing cookies.
 * 
 * - On SSR, it uses injected cookies from the context (via app.provide).
 * - On client-side, it syncs cookies from document.cookie.
 * - Supports two-way binding where changes in cookies are reflected in document.cookie.
 * 
 * @param pollInterval - The interval (in milliseconds) for polling cookies (defaults to 1000ms).
 * @returns A reactive reference (`ref`) containing the current cookies.
 */
export function useCookies(pollInterval = 1000) {
    // Sync cookies immediately
    syncCookies();

    // Start polling only if needed (client-side)
    if (!pollingActive && !isSSR()) {
        startPolling(pollInterval);
    }

    // Return the reactive cookies object
    return cookies;
}

// Export the function for updating cookies in document.cookie
export { updateCookies };
import { watch } from 'vue';
import { useCookies as globalUseCookies, updateCookies } from '../utils/cookiesStore.js';

/**
 * Custom hook for working with cookies.
 * 
 * - Uses the global cookie store to get and manage cookies.
 * - Updates document.cookie when cookies are modified.
 * 
 * @returns A reactive reference (`ref`) that holds the current cookies.
 */
export function useCookies() {
    const cookies = globalUseCookies();  // Access the global cookies store

    // Watch for changes to cookies and update document.cookie accordingly
    watch(cookies, (newCookies) => {
        updateCookies(newCookies);
    }, { deep: true });

    return cookies;
}

export function debounce(f, t) {
    let timeout = null;
    return function (...args) {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => f(...args), t);
    };
}

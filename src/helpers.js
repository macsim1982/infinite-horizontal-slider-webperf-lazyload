/**
 * Throttle and Debounce function
 * @see https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44
 * @param delay     Delay in millisecond
 * @param fn        Initial function to debounce or throttle
 *
 * USAGE: var throttledFunction = throttled(200, myFunction);
 *        var debouncedFunction = debounced(200, myFunction);
 */
export function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

export function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}

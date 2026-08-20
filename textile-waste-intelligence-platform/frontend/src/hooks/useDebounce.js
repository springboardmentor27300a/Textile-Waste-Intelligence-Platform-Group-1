import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds of inactivity. Used to avoid firing an API request on
 * every keystroke in search inputs.
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

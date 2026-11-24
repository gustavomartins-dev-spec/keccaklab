import { useCallback, useState } from 'react';

const read = (key: string): boolean => {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

/** Boolean UI preference (collapsed panels) remembered per browser; storage failures are ignored. */
export function usePersistentToggle(key: string): [boolean, () => void] {
  const [value, setValue] = useState(() => read(key));
  const toggle = useCallback(() => {
    setValue((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(key, next ? '1' : '0');
      } catch {
        /* private mode or blocked storage: keep the in-memory value */
      }
      return next;
    });
  }, [key]);
  return [value, toggle];
}

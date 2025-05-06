import { useEffect, useState } from "react";

export function useDebounce<T extends unknown>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value]);
  return debouncedValue;
}

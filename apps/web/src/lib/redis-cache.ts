import { redis } from "./db/redis";
import { ok, type Result } from "./result";
import { ActionError } from "astro:actions";

export function cache<
  T extends (...args: any) => Promise<Result<unknown, ActionError>>,
>(fn: T, calculateCacheKey: (...args: Parameters<T>) => string) {
  const newFn = async (...args: Parameters<T>) => {
    const key = calculateCacheKey(...args);
    const value = await redis.get(key);
    if (value) {
      return ok(value);
    }
    const result = await fn(...args);
    if (!result.success) {
      return result;
    }
    globalThis.waitUntil(saveValue(key, result.value));
    return result;
  };
  return newFn as T;
}

async function saveValue(key: string, value: any) {
  await redis.set(key, JSON.stringify(value), {
    ex: 60 * 60 * 24 * 365,
  });
}

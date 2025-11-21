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
    console.log("cache hit", key, value);
      return ok(value);
    }
    console.log("cache miss", key, value);
    const result = await fn(...args);
    console.log("cache miss x2", key, result);
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

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache invalidation error for pattern ${pattern}:`, error);
  }
}
// invalidateCache('*').then(res => console.log('yahooo', res)).catch(err => console.log('no yahoo', err))

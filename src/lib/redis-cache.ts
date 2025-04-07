import { getRedis } from "./db/redis";
import { ok, type Result } from "./result";
import type { ActionError } from "astro:actions";

export function cache<
  T extends (...args: any) => Promise<Result<unknown, ActionError>>,
>(fn: T, calculateCacheKey: (...args: Parameters<T>) => string) {
  const newFn = async (...args: Parameters<T>) => {
    const client = await getRedis();
    const key = calculateCacheKey(...args);
    const value = await client.get(key);
    if (value) {
      return ok(JSON.parse(value));
    }
    const result = await fn(...args);
    if (!result.success) {
      return result;
    }
    await client.set(key, JSON.stringify(result.value), {
      EX: 60 * 60 * 24 * 7,
    });
    return result;
  };
  return newFn as T;
}

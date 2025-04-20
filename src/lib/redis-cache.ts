import { redis } from "./db/redis";
import { logger } from "./logger";
import { ok, type Result } from "./result";
import { ActionError } from "astro:actions";

export function cache<
  T extends (...args: any) => Promise<Result<unknown, ActionError>>,
>(fn: T, calculateCacheKey: (...args: Parameters<T>) => string) {
  const newFn = async (...args: Parameters<T>) => {
    const start = Date.now();
    const key = calculateCacheKey(...args);
    const value = await redis.get(key);
    if (value) {
      logger.info("redis_cache_hit", {
        action: "redis_cache_hit",
        key,
        duration: `${Date.now() - start}ms`,
      });
      return ok(value);
    }
    const result = await fn(...args);
    if (!result.success) {
      return result;
    }
    await redis.set(key, JSON.stringify(result.value), {
      ex: 60 * 60 * 24 * 7,
    });
    logger.info("redis_cache_set", {
      action: "redis_cache_set",
      key,
      duration: `${Date.now() - start}ms`,
    });
    return result;
  };
  return newFn as T;
}

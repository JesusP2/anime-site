import { Redis } from "@upstash/redis/cloudflare";
import { REDIS_URL, REDIS_TOKEN } from "astro:env/server";

export const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

import { createClient, type RedisClientType } from "redis";
import { REDIS_URL } from "astro:env/server";

declare global {
  var redis: RedisClientType<any>;
}
export async function getRedis() {
  const client = await createClient({
    url: REDIS_URL,
  })
    .on("error", (err) => {
      console.error("Redis error:", err);
    })
    .connect();
  return client;
}

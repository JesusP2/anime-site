import { ActionError } from "astro:actions";
import { redis } from "./db/redis";

export async function getEmbedding(q: string) {
  const key = `embedding.${q}`;
  const value = await redis.get(key);
  if (value) {
    return value as number[];
  }
  const response = (await globalThis.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: [q],
  })) as { data: number[][] };
  if (!Array.isArray(response?.data?.[0])) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error",
    });
  }
  await redis.set(key, JSON.stringify(response.data[0]), {
    ex: 60 * 60 * 24 * 365,
  });
  return response.data[0];
}

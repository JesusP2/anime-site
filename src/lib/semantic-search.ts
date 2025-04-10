import { redis } from "./db/redis";
import { openai } from "./openai";

export async function getEmbedding(q: string) {
  const key = `embedding.${q}`;
  const value = await redis.get(key);
  if (value) {
    return value as number[];
  }
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: [q],
    encoding_format: "float",
  });
  await redis.set(key, JSON.stringify(embeddings.data[0]?.embedding), {
    ex: 60 * 60 * 24 * 365,
  });
  return embeddings.data[0]?.embedding;
}

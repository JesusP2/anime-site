import { getRedis } from "./db/redis";
import { openai } from "./openai";

export async function getEmbedding(q: string) {
  const client = await getRedis();
  const key = `embedding.${q}`;
  const value = await client.get(key);
  if (value) {
    return JSON.parse(value) as number[];
  }
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: [q],
    encoding_format: "float",
  });
  await client.set(key, JSON.stringify(embeddings.data[0]?.embedding), {
    EX: 60 * 60 * 24 * 365,
  });
  await client.disconnect();
  return embeddings.data[0]?.embedding;
}

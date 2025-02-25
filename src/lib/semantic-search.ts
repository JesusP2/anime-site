import { openai } from "./openai";

export async function getEmbedding(q: string) {
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: [q],
    encoding_format: "float",
  });
  return embeddings.data[0]?.embedding;
}

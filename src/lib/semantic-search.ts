import { openai } from "./openai";
import { client } from "./zilliz";

export async function getEmbedding(q: string) {
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: [q],
    encoding_format: "float",
  });
  return embeddings.data[0]?.embedding;
}

export async function semanticSearch(
  q: string,
  collection_name: string,
  topk: number,
): Promise<number[] | undefined> {
  const embedding = await getEmbedding(q);
  if (embedding) {
    const res = await client.search({
      topk,
      collection_name,
      data: [embedding],
      output_fields: ["id"],
    });
    return res.results.map(({ id }) => Number(id));
  }
}

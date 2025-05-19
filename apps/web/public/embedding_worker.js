import {
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";

let extractor;
self.onmessage = async function (event) {
  console.log("Worker received:", event.data);
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "mixedbread-ai/mxbai-embed-xsmall-v1",
    );
  }
  // Generate sentence embeddings
  const docs = [
    "Represent this sentence for searching relevant passages: A man is eating a piece of bread",
  ];
  const start = performance.now();
  const output = await extractor(docs, { pooling: "cls" });

  // Compute similarity scores
  const yo = output.tolist();
  console.log(yo)
  console.log("Time taken:", performance.now() - start);
  self.postMessage("Hello from the worker!");
};

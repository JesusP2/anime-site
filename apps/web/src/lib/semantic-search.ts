import { ActionError } from "astro:actions";
import { cache } from "./redis-cache";
import { err, ok } from "./result";
import { logger } from "./logger";

export const getEmbedding = cache(_getEmbedding, (args) => `embedding.${args}`);

async function _getEmbedding(q: string) {
  try {
    const response = (await globalThis.AI.run("@cf/baai/bge-small-en-v1.5", {
      text: [q],
    })) as { data: number[][] };
    if (!Array.isArray(response?.data?.[0])) {
      return err(
        new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error",
        }),
      );
    }

    return ok(response.data[0]);
  } catch (error) {
    globalThis.waitUntil(logger.error("error getting embedding", error));
    return err(
      new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      }),
    );
  }
}

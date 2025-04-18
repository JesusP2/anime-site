import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb } from "@/lib/db/pool";
import { trackedEntityTable } from "@/lib/db/schemas";
import { and, eq } from "drizzle-orm";
import { getEmbedding } from "@/lib/semantic-search";
import { entityStatuses } from "@/lib/constants";
import { gameActions } from "./games";
import { getConnectionString } from "@/lib/utils";
import {
  createDeletePresignedUrl,
  createReadPresignedUrl,
  createWritePresignedUrl,
} from "@/lib/s3";

export const server = {
  games: gameActions,
  updateEntity: defineAction({
    accept: "json",
    input: z.object({
      mal_id: z.number(),
      entityType: z.enum(["ANIME", "MANGA"]),
      status: z.enum(entityStatuses),
    }),
    handler: async ({ mal_id, entityType, status }, ctx) => {
      const userId = ctx.locals.user?.id;
      if (!userId) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const db = getDb(getConnectionString(ctx));
      await db
        .insert(trackedEntityTable)
        .values({
          userId: userId,
          entityType,
          entityStatus: status,
          userIdMalId: `${userId}-${mal_id}`,
          mal_id,
        })
        .onConflictDoUpdate({
          target: trackedEntityTable.userIdMalId,
          set: { mal_id, entityStatus: status },
        });
    },
  }),
  deleteEntity: defineAction({
    accept: "json",
    input: z.object({
      mal_id: z.number(),
    }),
    handler: async ({ mal_id }, ctx) => {
      const userId = ctx.locals.user?.id;
      if (!userId) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      await db
        .delete(trackedEntityTable)
        .where(
          and(
            eq(trackedEntityTable.userId, userId),
            eq(trackedEntityTable.mal_id, mal_id),
          ),
        );
    },
  }),
  getEmbedding: defineAction({
    accept: "json",
    input: z.object({
      q: z.string(),
    }),
    handler: async ({ q }, ctx) => {
      const embedding = await getEmbedding(q);
      return embedding;
    },
  }),
  createReadPresignedUrl: defineAction({
    accept: "json",
    input: z.object({
      key: z.string(),
    }),
    handler: async ({ key }) => {
      const url = await createReadPresignedUrl(key);
      return url;
    },
  }),
  createWritePresignedUrl: defineAction({
    accept: "json",
    input: z.object({
      key: z.string(),
      type: z.string(),
      size: z.number(),
    }),
    handler: async ({ key, type, size }) => {
      const url = await createWritePresignedUrl(key, type, size);
      return url;
    },
  }),
  createDeletePresignedUrl: defineAction({
    accept: "json",
    input: z.object({
      key: z.string(),
    }),
    handler: async ({ key }) => {
      const url = await createDeletePresignedUrl(key);
      return url;
    },
  }),
};

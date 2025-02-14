import { ActionError, defineAction } from "astro:actions";
import { auth } from "./auth";
import { z } from "astro:schema";
import { db } from "@/lib/db/pool";
import { trackedEntityTable } from "@/lib/db/schemas";
import { and, eq } from "drizzle-orm";
import { getEmbedding } from "@/lib/semantic-search";

export const server = {
  auth,
  updateEntity: defineAction({
    accept: "json",
    input: z.object({
      mal_id: z.number(),
      entityType: z.enum(["ANIME", "MANGA"]),
      status: z.string(),
    }),
    handler: async ({ mal_id, entityType, status }, context) => {
      const userId = context.locals.user?.id;
      if (!userId) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
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
    handler: async ({ mal_id }, context) => {
      const userId = context.locals.user?.id;
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
  semanticSearch: defineAction({
    accept: "json",
    input: z.object({
      q: z.string(),
    }),
    handler: async ({ q }) => {
      const embedding = await getEmbedding(q);
      return embedding;
    },
  }),
};

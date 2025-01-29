import { defineAction } from "astro:actions";
import { auth } from "./auth";
import { z } from "astro:schema";
import { db } from "@/lib/db/pool";
import { trackedEntityTable } from "@/lib/db/schemas";
import { ulid } from "ulidx";

export const server = {
  auth,
  updateEntity: defineAction({
    accept: "json",
    input: z.object({
      mal_id: z.number(),
      status: z.string(),
    }),
    handler: async ({ mal_id, status }, context) => {
      const userId = context.locals.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      await db
        .insert(trackedEntityTable)
        .values({
          userId: userId,
          entityType: "ANIME",
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
};

import { ActionError, defineAction } from "astro:actions";
import { z } from "zod";
import { getDb } from "@/lib/db/pool";
import {
  animeTable,
  challengeTable,
  challengeToThemeTable,
  animeThemeTable,
  gameTable,
} from "@/lib/db/schemas";
import { and, eq, gt, inArray, SQL, sql } from "drizzle-orm";
import { createChallengeSchema } from "@/lib/schemas";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/lib/db/schemas";
import { ulid } from "ulidx";

async function checkAuth(locals: App.Locals) {
  // Use App.Locals type
  const user = locals.user;
  if (!user?.id) {
    // Check for user and user.id on locals
    throw new Error("Not authenticated");
  }
  return user.id;
}

function getThemePoolLimits(
  difficulty: Omit<
    z.infer<typeof createChallengeSchema>["difficulty"],
    "custom"
  >,
) {
  switch (difficulty) {
    case "easy":
      return [0, 100];
    case "medium":
      return [100, 500];
    case "hard":
      return [500, 1000];
    case "impossible":
      return [1000, 5000];
    default:
      return [0, 1000];
  }
}

async function getThemePool(
  db: PostgresJsDatabase<typeof schema>,
  difficulty: Omit<
    z.infer<typeof createChallengeSchema>["difficulty"],
    "custom"
  >,
  type: "OP" | "ED" | "ALL",
  themeCount: number,
) {
  const [offset, limit] = getThemePoolLimits(difficulty) as [number, number];
  
  // Use materialized view for super fast theme selection
  let typeFilter = "";
  if (type !== "ALL") {
    typeFilter = `AND theme_type = '${type}'`;
  }

  const themes = await db.execute(
    sql`
      SELECT theme_id as id, anime_id as "animeId"
      FROM theme_popularity_view 
      WHERE popularity_rank > ${offset} 
        AND popularity_rank <= ${limit}
        ${sql.raw(typeFilter)}
      ORDER BY RANDOM()
      LIMIT ${themeCount * 3}
    `
  );

  // Step 3: Ensure 1 theme per anime (diversity guarantee)
  const result = [];
  const usedAnimes = new Set<string>();

  for (const theme of themes) {
    const themeData = theme as { id: string; animeId: string };
    if (themeData.animeId && themeData.id && !usedAnimes.has(themeData.animeId) && result.length < themeCount) {
      usedAnimes.add(themeData.animeId);
      result.push({ id: themeData.id, animeId: themeData.animeId });
    }
  }

  // If we don't have enough unique anime themes, fill with remaining
  if (result.length < themeCount) {
    for (const theme of themes) {
      if (result.length >= themeCount) break;
      const themeData = theme as { id: string; animeId: string };
      if (themeData.id && !result.find(t => t.id === themeData.id)) {
        result.push({ id: themeData.id, animeId: themeData.animeId });
      }
    }
  }

  return result;
}

export const challengeActions = {
  createChallenge: defineAction({
    accept: "json",
    input: createChallengeSchema,
    handler: async (data, ctx) => {
      const db = getDb();
      const creatorId = ctx.locals.user?.id ?? data.creatorId;
      const challengeId = ulid();
      if (data.isRandom) {
        const { difficulty, themeCount } = data;
        const themes = await getThemePool(
          db,
          difficulty,
          data.themeType,
          themeCount,
        );
        await db.transaction(async (tx) => {
          await tx.insert(challengeTable).values({
            id: challengeId,
            creatorId,
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            public: data.public,
          });
          for (const theme of themes) {
            await tx.insert(challengeToThemeTable).values({
              id: ulid(),
              challengeId,
              themeId: theme.id,
            });
          }
        });
      } else {
        const { songs, ...rest } = data;
        await db.transaction(async (tx) => {
          await tx.insert(challengeTable).values({
            id: challengeId,
            ...rest,
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          for (const song of songs) {
            await tx.insert(challengeToThemeTable).values({
              id: ulid(),
              challengeId,
              themeId: song.id,
            });
          }
        });
      }
      return challengeId;
    },
  }),

  updateChallenge: defineAction({
    accept: "form",
    input: z.object({
      challengeId: z.string().min(1),
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      public: z.preprocess((val: any) => val === "on", z.boolean()), // Handle checkbox
    }),
    handler: async (inputData, { locals }) => {
      // Access locals
      const userId = await checkAuth(locals); // Pass locals
      const db = getDb(); // Get DB instance
      await db.transaction(async (tx) => {
        // Use obtained db instance
        // 1. Verify the user owns the challenge
        const existingChallenge = await tx.query.challengeTable.findFirst({
          where: and(
            eq(challengeTable.id, inputData.challengeId),
            eq(challengeTable.creatorId, userId),
          ),
        });

        if (!existingChallenge) {
          throw new Error(
            "Challenge not found or user does not have permission.",
          );
        }

        await tx
          .update(challengeTable)
          .set({
            title: inputData.title,
            description: inputData.description,
            public: inputData.public,
            updatedAt: new Date(), // Update timestamp
          })
          .where(eq(challengeTable.id, inputData.challengeId));
      });
      return { success: true, challengeId: inputData.challengeId };
    },
  }),

  deleteChallenge: defineAction({
    accept: "json",
    input: z.object({
      challengeId: z.string().min(1),
    }),
    handler: async ({ challengeId }, { locals }) => {
      const userId = await checkAuth(locals); // Pass locals
      const db = getDb(); // Get DB instance
      const existingChallenge = await db
        .select()
        .from(challengeTable)
        .where(
          and(
            eq(challengeTable.id, challengeId),
            eq(challengeTable.creatorId, userId),
          ),
        );
      if (!existingChallenge) {
        throw new ActionError({
          code: "NOT_FOUND",
          message:
            "Challenge not found or user does not have permission to delete.",
        });
      }
      await db.delete(challengeTable).where(eq(challengeTable.id, challengeId));
      return { success: true };
    },
  }),
};

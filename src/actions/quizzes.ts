import { ActionError, defineAction } from "astro:actions";
import { z } from "zod";
import { getDb } from "@/lib/db/pool";
import {
  animeTable,
  quizTable,
  quizToThemeTable,
  animeThemeTable,
  gameTable,
} from "@/lib/db/schemas";
import { and, eq, gt, inArray, SQL, sql } from "drizzle-orm";
import { createQuizSchema } from "@/lib/schemas";
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
  difficulty: Omit<z.infer<typeof createQuizSchema>["difficulty"], "custom">,
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
  difficulty: Omit<z.infer<typeof createQuizSchema>["difficulty"], "custom">,
  type: "OP" | "ED" | "ALL",
  themeCount: number,
) {
  const [offset, limit] = getThemePoolLimits(difficulty) as [number, number];
  let themePositions: number[] = [];
  for (let i = 0; i < themeCount; i++) {
    themePositions.push(Math.floor(Math.random() * (limit - offset)) + offset);
  }
  let where: SQL | undefined = gt(animeTable.popularity, 0);
  if (type !== "ALL") {
    where = and(where, eq(animeThemeTable.type, type));
  }
  const sq = db
    .select({
      id: animeThemeTable.id,
      position:
        sql<number>`ROW_NUMBER() OVER (ORDER BY ${animeTable.popularity})`.as(
          "position",
        ),
    })
    .from(animeThemeTable)
    .innerJoin(animeTable, eq(animeThemeTable.animeId, animeTable.id))
    .where(where)
    .as("sq");
  const themes = await db
    .select()
    .from(sq)
    .where(inArray(sq.position, themePositions));
  return themes;
}

export const quizActions = {
  createQuiz: defineAction({
    accept: "json",
    input: createQuizSchema,
    handler: async (data, ctx) => {
      const db = getDb();
      const creatorId = ctx.locals.user?.id ?? data.creatorId;
      const quizId = ulid();
      if (data.isRandom) {
        const { difficulty, themeCount } = data;
        const themes = await getThemePool(
          db,
          difficulty,
          data.themeType,
          themeCount,
        );
        await db.transaction(async (tx) => {
          await tx.insert(quizTable).values({
            id: quizId,
            creatorId,
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            public: data.public,
          });
          for (const theme of themes) {
            await tx.insert(quizToThemeTable).values({
              id: ulid(),
              quizId,
              themeId: theme.id,
            });
          }
        });
      } else {
        const { songs, ...rest } = data;
        await db.transaction(async (tx) => {
          await tx.insert(quizTable).values({
            id: quizId,
            ...rest,
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          for (const song of songs) {
            await tx.insert(quizToThemeTable).values({
              id: ulid(),
              quizId,
              themeId: song.id,
            });
          }
        });
      }
      return quizId;
    },
  }),

  updateQuiz: defineAction({
    accept: "form",
    input: z.object({
      quizId: z.string().min(1),
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
        // 1. Verify the user owns the quiz
        const existingQuiz = await tx.query.quizTable.findFirst({
          where: and(
            eq(quizTable.id, inputData.quizId),
            eq(quizTable.creatorId, userId),
          ),
        });

        if (!existingQuiz) {
          throw new Error("Quiz not found or user does not have permission.");
        }

        await tx
          .update(quizTable)
          .set({
            title: inputData.title,
            description: inputData.description,
            public: inputData.public,
            updatedAt: new Date(), // Update timestamp
          })
          .where(eq(quizTable.id, inputData.quizId));
      });
      return { success: true, quizId: inputData.quizId };
    },
  }),

  deleteQuiz: defineAction({
    accept: "json",
    input: z.object({
      quizId: z.string().min(1),
    }),
    handler: async ({ quizId }, { locals }) => {
      const userId = await checkAuth(locals); // Pass locals
      const db = getDb(); // Get DB instance
      const existingQuiz = await db
        .select()
        .from(quizTable)
        .where(and(eq(quizTable.id, quizId), eq(quizTable.creatorId, userId)));
      if (!existingQuiz) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Quiz not found or user does not have permission to delete.",
        });
      }
      await db.delete(quizTable).where(eq(quizTable.id, quizId));
      return { success: true };
    },
  }),
};

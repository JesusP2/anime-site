import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb } from "@/lib/db/pool";
import { and, eq, gt, inArray, SQL, sql } from "drizzle-orm";
import { createQuizSchema } from "@/lib/schemas";
import { ulid } from "ulidx";
import {
  animeTable,
  gameTable,
  quizTable,
  quizToThemeTable,
  themeTable,
} from "@/lib/db/schemas";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/lib/db/schemas";

function getThemePoolNumber(
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
  type: "opening" | "ending" | "all",
  themeCount: number,
) {
  const [offset, limit] = getThemePoolNumber(difficulty) as [number, number];
  let themePositions: number[] = [];
  for (let i = 0; i < themeCount; i++) {
    themePositions.push(Math.floor(Math.random() * (limit - offset)) + offset);
  }
  let where: SQL | undefined = gt(animeTable.popularity, 0);
  if (type !== "all") {
    where = and(where, eq(themeTable.type, type));
  }
  const sq = db
    .select({
      id: themeTable.id,
      position:
        sql<number>`ROW_NUMBER() OVER (ORDER BY ${animeTable.popularity})`.as(
          "position",
        ),
    })
    .from(themeTable)
    .innerJoin(animeTable, eq(themeTable.animeId, animeTable.id))
    .where(where)
    .as("sq");
  const themes = await db
    .select()
    .from(sq)
    .where(inArray(sq.position, themePositions));
  return themes;
}
export const gameActions = {
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
            createdAt: new Date(),
            updatedAt: new Date(),
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
  createGame: defineAction({
    accept: "json",
    input: z.object({
      quizId: z.string().ulid(),
      creatorId: z.string().optional(),
      gameType: z.enum(["solo", "multiplayer"]),
    }),
    handler: async (data, ctx) => {
      const db = getDb();
      const { quizId } = data;
      let creatorId = ctx.locals.user?.id ?? data.creatorId;
      if (!creatorId) {
        return new ActionError({
          code: "UNAUTHORIZED",
          message: "Invalid user",
        });
      }

      const gameId = ulid();
      await db.insert(gameTable).values({
        id: gameId,
        creatorId,
        gameType: data.gameType,
        public: true,
        quizId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return gameId;
    },
  }),
};

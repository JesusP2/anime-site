import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb } from "@/lib/db/pool";
import { and, eq } from "drizzle-orm";
import {
  createQuizInfoSectionSchema,
  createQuizSongSelectionSectionSchema,
} from "@/lib/schemas";
import { ulid } from "ulidx";
import { gameTable, quizTable, quizToThemeTable } from "@/lib/db/schemas";

export const gameActions = {
  createQuiz: defineAction({
    accept: "json",
    input: createQuizInfoSectionSchema.merge(
      createQuizSongSelectionSectionSchema,
    ),
    handler: async (data, context) => {
      const db = getDb();
      const { songs, ...rest } = data;

      const quizId = ulid();
      await db.transaction(async (tx) => {
        await tx.insert(quizTable).values({
          id: quizId,
          ...rest,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        for (const song of songs) {
          await tx.insert(quizToThemeTable).values({
            quizId,
            themeId: song.id,
          });
        }
      });
      return quizId;
    },
  }),

  createGame: defineAction({
    accept: "json",
    input: z.object({
      quizId: z.string(),
    }),
    handler: async (data) => {
      const db = getDb();
      const { quizId } = data;

      const gameId = ulid();
      await db.insert(gameTable).values({
        id: gameId,
        quizId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return gameId;
    },
  }),
};

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb } from "@/lib/db/pool";
import { ulid } from "ulidx";
import { gameTable } from "@/lib/db/schemas";

export const gameActions = {
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
        throw new ActionError({
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

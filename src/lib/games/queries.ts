import { count, eq } from "drizzle-orm";
import { getDb } from "../db/pool";
import { gameTable, quizTable, quizToThemeTable } from "../db/schemas";
import { err, ok } from "../result";
import { ActionError } from "astro:actions";

export async function getGameInfo(gameId: string) {
  const db = getDb();
  const [gameInfo] = await db
    .select({
      quizId: quizTable.id,
      gameType: gameTable.gameType,
      title: quizTable.title,
      description: quizTable.description,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
    })
    .from(gameTable)
    .leftJoin(quizTable, eq(gameTable.quizId, quizTable.id))
    .where(eq(gameTable.id, gameId))
    .limit(1);
  if (!gameInfo?.quizId) {
    return err(
      new ActionError({
        code: "NOT_FOUND",
        message: "Game not found",
      }),
    );
  }
  const themesCount = await db
    .select({
      count: count(),
    })
    .from(quizToThemeTable)
    .where(eq(quizToThemeTable.quizId, gameInfo.quizId));
  return ok({ ...gameInfo, themesCount: themesCount[0]?.count as number });
}

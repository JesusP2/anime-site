import { eq } from "drizzle-orm";
import { getDb } from "../db/pool";
import { gameTable, quizTable } from "../db/schemas";

export async function getGameInfo(gameId: string) {
  const db = getDb();
  const gameInfo = await db
    .select({
      gameType: gameTable.gameType,
      title: quizTable.title,
      description: quizTable.description,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
    })
    .from(gameTable)
    .leftJoin(quizTable, eq(gameTable.quizId, quizTable.id))
    .where(eq(gameTable.id, gameId));
  return gameInfo;
}

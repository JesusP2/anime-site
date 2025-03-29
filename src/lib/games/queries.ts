import { count, eq } from "drizzle-orm";
import { getDb } from "../db/pool";
import {
  animeTable,
  gameTable,
  quizTable,
  quizToThemeTable,
  themeTable,
} from "../db/schemas";
import { err, ok } from "../result";
import { ActionError } from "astro:actions";
import { getRecordTitle } from "../anime-title";

export async function getGameInfo(gameId: string) {
  const db = getDb();
  const [_gameInfo] = await db
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
  if (!_gameInfo?.quizId) {
    return err(
      new ActionError({
        code: "NOT_FOUND",
        message: "Game not found",
      }),
    );
  }
  const songs = await db
    .select({
      id: themeTable.id,
      name: themeTable.name,
      url: themeTable.url,
      titles: animeTable.titles,
    })
    .from(animeTable)
    .innerJoin(themeTable, eq(animeTable.id, themeTable.animeId))
    .innerJoin(quizToThemeTable, eq(themeTable.id, quizToThemeTable.themeId))
    .innerJoin(gameTable, eq(quizToThemeTable.quizId, gameTable.quizId))
    .where(eq(gameTable.id, gameId));

  return ok({
    ..._gameInfo,
    songs: songs.map((song) => ({
      ...song,
      url: song.url[0] as string,
      animeName: getRecordTitle(song.titles),
    })),
  });
}

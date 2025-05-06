import { eq } from "drizzle-orm";
import { getDb } from "../db/pool";
import {
  animeTable,
  gameTable,
  quizTable,
  quizToThemeTable,
  animeThemeTable,
  themeVideoTable,
  themeEntryTable,
} from "../db/schemas";
import { err, ok } from "../result";
import { ActionError } from "astro:actions";
import { getRecordTitle } from "../anime-title";

export async function getGameInfo(gameId: string) {
  const db = getDb();
  const gameInfoPromise = db
    .select({
      creatorId: gameTable.creatorId,
      title: quizTable.title,
      description: quizTable.description,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
      quizId: quizTable.id,
      gameType: gameTable.gameType,
    })
    .from(gameTable)
    .where(eq(gameTable.id, gameId))
    .leftJoin(quizTable, eq(gameTable.quizId, quizTable.id))
    .limit(1);
  const songsPromises = db
    .select({
      id: themeVideoTable.id,
      lyrics: themeVideoTable.lyrics,
      themeId: animeThemeTable.id,
      themeEntryId: themeEntryTable.id,
      resolution: themeVideoTable.resolution,
      name: animeThemeTable.title,
      url: themeVideoTable.link,
      titles: animeTable.titles,
    })
    .from(animeTable)
    .where(eq(gameTable.id, gameId))
    .innerJoin(animeThemeTable, eq(animeThemeTable.animeId, animeTable.id))
    .innerJoin(
      quizToThemeTable,
      eq(quizToThemeTable.themeId, animeThemeTable.id),
    )
    .innerJoin(gameTable, eq(quizToThemeTable.quizId, gameTable.quizId))
    .innerJoin(themeEntryTable, eq(themeEntryTable.themeId, animeThemeTable.id))
    .innerJoin(
      themeVideoTable,
      eq(themeVideoTable.themeEntryId, themeEntryTable.id),
    );
  const promisesResult = await Promise.allSettled([
    gameInfoPromise,
    songsPromises,
  ]);
  if (
    promisesResult[0].status === "rejected" ||
    !promisesResult[0].value.length
  ) {
    return err(
      new ActionError({ code: "NOT_FOUND", message: "Game not found" }),
    );
  } else if (
    promisesResult[1].status === "rejected" ||
    !promisesResult[1].value.length
  ) {
    return err(
      new ActionError({ code: "NOT_FOUND", message: "Songs not found" }),
    );
  }
  const _gameInfo = promisesResult[0].value[0];
  type Song = {
    id: string;
    lyrics: boolean | null;
    themeId: string;
    themeEntryId: string;
    resolution: number | null;
    name: string | null;
    url: string;
    animeName: string;
  };
  let songs: Song[] = [];
  for (const song of promisesResult[1].value) {
    const savedSong = songs.find((s) => s.themeId === song.themeId);
    const savedSongIdx = songs.findIndex((s) => s.themeId === song.themeId);
    const isCurrentSongResolutionHigher =
      savedSong?.resolution &&
      song.resolution &&
      savedSong.resolution < song.resolution;
    if (!savedSong) {
      songs.push({
        ...song,
        animeName: getRecordTitle(song.titles),
      });
    } else if (
      isCurrentSongResolutionHigher ||
      (!savedSong.lyrics && song.lyrics)
    ) {
      songs[savedSongIdx] = {
        ...song,
        animeName: getRecordTitle(song.titles),
      };
    }
  }
  return ok({
    ..._gameInfo,
    songs,
  });
}

import { getRecordTitle } from "@/lib/anime-title";
import { getDb } from "@/lib/db/pool";
import {
  animeTable,
  quizTable,
  quizToThemeTable,
  animeThemeTable,
  themeEntryTable,
  themeVideoTable,
} from "@/lib/db/schemas";
import { eq } from "drizzle-orm";

export async function getQuizInfo(
  quizId: string,
) {
  const db = getDb();
  const result = await db
    .select({
      quizTitle: quizTable.title,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
      createdAt: quizTable.createdAt,
      themeId: quizToThemeTable.themeId,
    })
    .from(quizTable)
    .where(eq(quizTable.id, quizId))
    .leftJoin(quizToThemeTable, eq(quizTable.id, quizToThemeTable.quizId));
  const quizInfo = {
    title: result[0]?.quizTitle,
    difficulty: result[0]?.difficulty,
    public: result[0]?.public,
    createdAt: result[0]?.createdAt,
    themesLength: result.length,
  };
  return quizInfo;
}

export async function getQuizCompleteInfo(
  quizId: string,
) {
  const db = getDb();
  const result = await db
    .select({
      quizTitle: quizTable.title,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
      createdAt: quizTable.createdAt,
      themeId: animeThemeTable.id,
      themeUrls: themeVideoTable.link,
      themeName: animeThemeTable.title,
      animeTitles: animeTable.titles,
    })
    .from(quizTable)
    .where(eq(quizTable.id, quizId))
    .leftJoin(quizToThemeTable, eq(quizTable.id, quizToThemeTable.quizId))
    .leftJoin(animeThemeTable, eq(quizToThemeTable.themeId, animeThemeTable.id))
    .leftJoin(animeTable, eq(animeThemeTable.animeId, animeTable.id))
    .innerJoin(themeEntryTable, eq(themeEntryTable.themeId, animeThemeTable.id))
    .innerJoin(
      themeVideoTable,
      eq(themeVideoTable.themeEntryId, themeEntryTable.id),
    )
  const themes = result.map((theme) => ({
    id: theme.themeId,
    title: theme.themeName,
    animeTitle: getRecordTitle(theme.animeTitles),
    url: theme.themeUrls,
  }));
  const quizInfo = {
    title: result[0]?.quizTitle,
    difficulty: result[0]?.difficulty,
    public: result[0]?.public,
    createdAt: result[0]?.createdAt,
    themes,
  };
  return quizInfo;
}

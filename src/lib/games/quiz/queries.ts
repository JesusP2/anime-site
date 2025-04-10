import { getRecordTitle } from "@/lib/anime-title";
import { getDb } from "@/lib/db/pool";
import {
  animeTable,
  quizTable,
  quizToThemeTable,
  themeTable,
} from "@/lib/db/schemas";
import { getConnectionString } from "@/lib/utils";
import type { APIContext } from "astro";
import type { ActionAPIContext } from "astro:actions";
import { eq } from "drizzle-orm";

export async function getQuizInfo(
  quizId: string,
  context: APIContext | ActionAPIContext,
) {
  const db = getDb(getConnectionString(context));
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
  context: APIContext | ActionAPIContext,
) {
  const db = getDb(getConnectionString(context));
  const result = await db
    .select({
      quizTitle: quizTable.title,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
      createdAt: quizTable.createdAt,
      themeId: themeTable.id,
      themeUrls: themeTable.url,
      themeName: themeTable.name,
      animeTitles: animeTable.titles,
    })
    .from(quizTable)
    .where(eq(quizTable.id, quizId))
    .leftJoin(quizToThemeTable, eq(quizTable.id, quizToThemeTable.quizId))
    .leftJoin(themeTable, eq(quizToThemeTable.themeId, themeTable.id))
    .leftJoin(animeTable, eq(themeTable.animeId, animeTable.id));
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

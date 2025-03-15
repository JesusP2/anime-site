import { getRecordTitle } from "@/lib/anime-title";
import { getDb } from "@/lib/db/pool";
import {
  animeTable,
  quizTable,
  quizToThemeTable,
  themeTable,
} from "@/lib/db/schemas";
import { eq } from "drizzle-orm";

export async function getQuiz(quizId: string) {
  const db = getDb();
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
  console.log('quiz info:', quizInfo.themes)
  return quizInfo;
}

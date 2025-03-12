import { pgTable } from "drizzle-orm/pg-core";
import { themeTable } from "./theme";

export const gameTable = pgTable("game", (t) => ({
  id: t.text("id").primaryKey(),
  creatorId: t.text("creator_id").notNull(),
  quizId: t
    .text("quiz_id")
    .notNull()
    .references(() => themeTable.id),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

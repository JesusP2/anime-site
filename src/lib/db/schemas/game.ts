import { pgTable } from "drizzle-orm/pg-core";
import { quizTable } from "./quiz";

export const gameTable = pgTable("game", (t) => ({
  id: t.text("id").primaryKey(),
  creatorId: t.text("creator_id"),
  quizId: t
    .text("quiz_id")
    .notNull()
    .references(() => quizTable.id),
  gameType: t.text("game_type").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

import { pgTable } from "drizzle-orm/pg-core";
import { challengeTable } from "./challenge";

export const gameTable = pgTable("game", (t) => ({
  id: t.text("id").primaryKey(),
  creatorId: t.text("creator_id"),
  challengeId: t
    .text("challenge_id")
    .notNull()
    .references(() => challengeTable.id, { onDelete: "cascade" }),
  gameType: t.text("game_type").notNull(),
  public: t.boolean("public").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

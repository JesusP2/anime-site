import {
  integer,
  pgTable,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulidx";

export * from "./anime";
export * from "./manga";
export * from "./character";
export * from "./auth";

export const trackedEntityTable = pgTable("tracked_entity", {
  id: varchar("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  userId: varchar("user_id", {
    length: 64,
  }).notNull(),
  entityType: varchar("user_type", {
    enum: ["ANIME", "LIGHT-NOVEL", "MANGA"],
  }).notNull(),
  entityStatus: varchar("entity_status", {
    length: 255,
  }).notNull(),
  mal_id: integer("mal_id").notNull(),
  userIdMalId: varchar("user_id_mal_id", {
    length: 255,
  })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

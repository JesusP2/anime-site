import { entityStatuses } from "@/lib/constants";
import type { EntityStatus } from "@/lib/types";
import {
  integer,
  pgTable,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulidx";

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
    enum: ['ANIME', 'MANGA'],
  }).notNull(),
  entityStatus: varchar('entity_status', {
    enum: entityStatuses,
  }).notNull().$type<EntityStatus>(),
  mal_id: integer("mal_id").notNull(),
  userIdMalId: varchar("user_id_mal_id", {
    length: 255,
  })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


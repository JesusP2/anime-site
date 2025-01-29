import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

export * from "./anime";
export * from "./manga";
export * from "./character";
export * from "./auth";

export const trackedEntity = sqliteTable('tracked_entity', {
  id: text('id', {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  userId: text('user_id', {
    length: 64,
  }).notNull(),
  entityType: text('user_type', {
    enum: ['ANIME', 'LIGHT-NOVEL', 'MANGA'],
  }).notNull(),
  entityStatus: text('entity_status', {
    length: 255,
  }).notNull(),
  mal_id: integer('mal_id').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

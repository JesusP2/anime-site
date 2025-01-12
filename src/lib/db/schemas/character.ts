import { ulid } from 'ulidx';
import { sqliteTable } from './table';
import { integer, text } from 'drizzle-orm/sqlite-core';

export const character = sqliteTable('character', {
  id: text('id', {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer('mal_id').unique(),
  url: text('url').unique(),
  images: text('images'), //json
  name: text('name'),
  name_kanji: text('name_kanji'),
  nicknames:text('nicknames'), //json
  favorites: integer('favorites'),
  about: text('about'),
  anime: text('anime'), //json
  manga: text('manga'), //json
  voices: text('voices'), //json
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

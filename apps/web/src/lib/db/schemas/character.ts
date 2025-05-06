import { ulid } from "ulidx";
import {
  integer,
  pgTable,
  varchar,
  json,
  timestamp,
} from "drizzle-orm/pg-core";

export const characterTable = pgTable("character", {
  id: varchar("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer("mal_id").unique(),
  url: varchar("url").unique(),
  images: varchar("images"), //json
  name: varchar("name"),
  name_kanji: varchar("name_kanji"),
  nicknames: json("nicknames"), //json
  favorites: integer("favorites"),
  about: varchar("about"),
  anime: json("anime"), //json
  manga: json("manga"), //json
  voices: json("voices"), //json
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

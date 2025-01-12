import { sqliteTableCreator } from 'drizzle-orm/sqlite-core';

export const sqliteTable = sqliteTableCreator((name) => `anime_${name}`)

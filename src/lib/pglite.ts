import { PGlite } from '@electric-sql/pglite'

export const localDB = new PGlite('idb://my-pgdata')

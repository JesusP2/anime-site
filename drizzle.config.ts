import type { Config } from "drizzle-kit";

export default {
  dialect: "turso",
  schema: "./src/lib/db/schemas",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  },
} satisfies Config;

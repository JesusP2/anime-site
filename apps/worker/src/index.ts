import { Hono } from "hono";
import { api } from "./api";
import { cors } from "hono/cors";
export { Game } from "./counter-do";

const app = new Hono()
  .use(
    "*",
    cors({
      origin: "*",
    }),
  )
  .route("/api", api);

export default app;
export type AppType = typeof app;

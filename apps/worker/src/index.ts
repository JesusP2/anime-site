import { Hono } from "hono";
import { api } from "./api";
export { Game } from "./counter-do";

const app = new Hono().route("/api", api);

export default app;
export type AppType = typeof app;

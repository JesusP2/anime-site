import { Hono } from "hono";
import type { Bindings } from "./types";

export const api = new Hono<{ Bindings: Bindings }>().get(
  "/counter",
  async (c) => {
    const env = c.env;
    const id = env.GAME.idFromName("GAME");
    const stub = env.GAME.get(id);
    stub.increment();
    const counterValue = await stub.getCounterValue();
    return c.text(counterValue.toString());
  },
);

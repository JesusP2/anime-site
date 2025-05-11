import { Hono } from "hono";
import type { Bindings } from "./types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const api = new Hono<{ Bindings: Bindings }>().get(
  "/ws",
  zValidator("query", z.object({ matchId: z.string() })),
  async (c) => {
    if (c.req.header("upgrade") !== "websocket") {
      return c.text("Expected Upgrade: websocket", 426);
    }
    const { matchId } = c.req.valid("query");
    const id = c.env.GAME.idFromName(matchId);
    const stub = c.env.GAME.get(id);
    return stub.fetch(c.req.raw);
  },
);

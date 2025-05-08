import { z } from "zod";

export const pingMessageSchema = z.object({
  type: z.literal("ping"),
});

export const playerJoinMessageSchema = z.object({
  type: z.literal("player_join"),
  payload: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const gameStartMessageSchema = z.object({
  type: z.literal("game_start"),
});

export const updatePlayersMessageSchema = z.object({
  type: z.literal("player_update"),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      score: z.number(),
    }),
  ),
});

export const messageSchema = z.discriminatedUnion("type", [
  pingMessageSchema,
  playerJoinMessageSchema,
  gameStartMessageSchema,
]);

// ---------- Responses ----------
export const playerJoinResponseSchema = z.object({
  type: z.literal("player_join_response"),
  payload: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});

export const gameStartResponseSchema = z.object({
  type: z.literal("game_start_response"),
});

export const pongResponseSchema = z.object({
  type: z.literal("pong"),
});

export const responseSchema = z.discriminatedUnion("type", [
  playerJoinResponseSchema,
  gameStartResponseSchema,
  pongResponseSchema,
]);

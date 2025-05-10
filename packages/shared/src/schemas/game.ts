import { z } from "zod";

export const playerJoinMessageSchema = z.object({
  type: z.literal("player_join"),
  payload: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    songs: z.array(
      z.object({
        id: z.string(),
        animeName: z.string(),
        name: z.string(),
        url: z.string(),
        themeId: z.string(),
      }),
    ),
  }),
});

export const gameStartMessageSchema = z.object({
  type: z.literal("game_start"),
});

export const forceGameStartMessageSchema = z.object({
  type: z.literal("force_game_start"),
});

export const playerUpdateMessageSchema = z.object({
  type: z.literal("player_update"),
  player: z.object({
    id: z.string(),
    songIdx: z.number(),
    score: z.number(),
  }),
});

export const revealThemeMessageSchema = z.object({
  type: z.literal("reveal_theme"),
});

export const playerReadyMessageSchema = z.object({
  type: z.literal("player_ready"),
});

export const pingMessageSchema = z.object({
  type: z.literal("ping"),
});

export const deleteDurableObjectMessageSchema = z.object({
  type: z.literal("delete_do"),
});

export const messageSchema = z.discriminatedUnion("type", [
  pingMessageSchema,
  playerJoinMessageSchema,
  gameStartMessageSchema,
  forceGameStartMessageSchema,
  playerUpdateMessageSchema,
  deleteDurableObjectMessageSchema,
  revealThemeMessageSchema,
  playerReadyMessageSchema,
]);

export const playerJoinResponseSchema = z.object({
  type: z.literal("player_join_response"),
  payload: z.object({
    hasGameStarted: z.boolean(),
    players: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        score: z.number(),
        isHost: z.boolean(),
        avatar: z.string().optional(),
        songIdx: z.number(),
      }),
    ),
  }),
});

export const gameStartResponseSchema = z.object({
  type: z.literal("game_start_response"),
});

export const playerUpdateResponseSchema = z.object({
  type: z.literal("player_update_response"),
  payload: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      score: z.number(),
    }),
  ),
});

export const revealThemeResponseSchema = z.object({
  type: z.literal("reveal_theme_response"),
  payload: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      score: z.number(),
    }),
  ),
});

export const playersNotReadyResponseSchema = z.object({
  type: z.literal("players_not_ready_response"),
});

export const pongResponseSchema = z.object({
  type: z.literal("pong"),
});

export const responseSchema = z.discriminatedUnion("type", [
  playerJoinResponseSchema,
  gameStartResponseSchema,
  playerUpdateResponseSchema,
  pongResponseSchema,
  revealThemeResponseSchema,
  playersNotReadyResponseSchema,
]);

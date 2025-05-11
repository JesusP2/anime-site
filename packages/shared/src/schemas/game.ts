import { z } from "zod";

export const playerJoinMessageSchema = z.object({
  type: z.literal("player_join"),
  senderId: z.string(),
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
  senderId: z.string(),
});

export const forceGameStartMessageSchema = z.object({
  type: z.literal("force_game_start"),
  senderId: z.string(),
});

export const playerUpdateMessageSchema = z.object({
  type: z.literal("player_update"),
  senderId: z.string(),
  player: z.object({
    id: z.string(),
    songIdx: z.number(),
    score: z.number(),
  }),
});

export const revealThemeMessageSchema = z.object({
  type: z.literal("reveal_theme"),
  senderId: z.string(),
});

export const playerReadyMessageSchema = z.object({
  type: z.literal("player_ready"),
  senderId: z.string(),
});

export const pingMessageSchema = z.object({
  type: z.literal("ping"),
  senderId: z.string(),
});

export const deleteDurableObjectMessageSchema = z.object({
  type: z.literal("delete_do"),
  senderId: z.string(),
});

export const clientChatMessageSchema = z.object({
  type: z.literal("client_chat_message"),
  senderId: z.string(),
  payload: z.object({
    text: z.string().min(1).max(280),
  }),
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
  clientChatMessageSchema,
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

export const serverChatBroadcastSchema = z.object({
  type: z.literal("server_chat_broadcast"),
  payload: z.object({
    messageId: z.string(),
    senderId: z.string(),
    senderName: z.string(),
    text: z.string(),
    timestamp: z.number(),
    chatMessageType: z.enum(["player", "system", "game_event"]),
  }),
});

export const responseSchema = z.discriminatedUnion("type", [
  playerJoinResponseSchema,
  gameStartResponseSchema,
  playerUpdateResponseSchema,
  pongResponseSchema,
  revealThemeResponseSchema,
  playersNotReadyResponseSchema,
  serverChatBroadcastSchema,
]);

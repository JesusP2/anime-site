import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";
import { messageSchema, responseSchema } from "@repo/shared/schemas/game";
import { ulid } from "ulidx";

export class Game extends DurableObject<Bindings> {
  TIMEOUT = 10;
  startedAt: Date | null = null;
  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env);
    this.initializeStorage();
  }

  async fetch() {
    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];
    this.ctx.acceptWebSocket(server);

    // the game will last 5 minutes if it never starts
    const time = 1000 * 60 * 5;
    await this.ctx.storage.setAlarm(new Date(Date.now() + time));
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, messageData: string | ArrayBuffer) {
    if (typeof messageData !== "string") {
      console.error("Received non-string WebSocket message:", messageData);
      ws.close(1011, "Invalid message format");
      return;
    }

    const message = messageSchema.parse(JSON.parse(messageData));
    switch (message.type) {
      case "player_join": {
        this.storePlayerInfo(ws, message.payload);
        const gameInfo = this.getGameInfo();
        if (!gameInfo || !("id" in gameInfo)) {
          this.storeGameInfo(message.payload.songs);
        }
        const players = this.fetchPlayersFromDb();
        const response = responseSchema.parse({
          type: "player_join_response",
          payload: {
            players,
            hasGameStarted: !!gameInfo?.game_started,
          },
        });
        this.broadcast(response);

        // Fetch and send recent chat history to the joining player
        const chatHistoryCursor = this.ctx.storage.sql.exec(
          "SELECT id, player_id, player_name, text, message_type, timestamp FROM chat_messages ORDER BY timestamp DESC LIMIT 50",
        );
        const chatHistory = chatHistoryCursor.toArray().reverse() as {
          id: string;
          player_id: string;
          player_name: string;
          text: string;
          message_type: "player" | "system" | "game_event";
          timestamp: number;
        }[];

        if (chatHistory.length > 0) {
          // Send as individual messages to allow client to process them sequentially
          chatHistory.forEach((msg) => {
            const historyMessage = responseSchema.parse({
              type: "server_chat_broadcast",
              payload: {
                messageId: msg.id,
                senderId: msg.player_id,
                senderName: msg.player_name,
                text: msg.text,
                timestamp: msg.timestamp,
                chatMessageType: msg.message_type,
              },
            });
            ws.send(JSON.stringify(historyMessage)); // Send directly to the joining player
          });
        }

        break;
      }
      case "force_game_start":
      case "game_start":
        const isHost = this.isHost(ws);
        if (!isHost) {
          console.error("Unauthorized: game_start");
          ws.close(1011, "Unauthorized");
          return;
        }
        const areAllPlayersReady = this.fetchPlayersFromDb().every(
          (player) => player.id === message.senderId || player.isReady,
        );
        if (!areAllPlayersReady && message.type === "game_start") {
          const response = responseSchema.parse({
            type: "players_not_ready_response",
          });
          ws.send(JSON.stringify(response));
          return;
        }
        this.ctx.storage.sql.exec(
          "UPDATE players SET score = 0, current_song_idx = 0",
        );
        const gameInfo = this.getGameInfo();
        if (!gameInfo?.game_started) {
          this.ctx.storage.sql.exec(
            "UPDATE game_info SET game_started = TRUE WHERE id = ?",
            gameInfo?.id,
          );
          const parsedSongs = JSON.parse(gameInfo?.songs ?? "[]");
          // TIMEOUT = half the time for 1 round. We use 10 instead of 2 because we need to take into account the the time for videos to load and reconnect.
          const time = this.TIMEOUT * 10 * (parsedSongs.length + 1) * 1000;
          await this.ctx.storage.deleteAlarm();
          await this.ctx.storage.setAlarm(new Date(Date.now() + time));
        }
        const response = responseSchema.parse({
          type: "game_start_response",
        });
        this.broadcast(response);
        break;
      case "player_ready": {
        this.ctx.storage.sql.exec(
          "UPDATE players SET is_ready = TRUE WHERE id = ?",
          message.senderId,
        );
        break;
      }
      case "player_update": {
        const id = ulid();
        this.ctx.storage.sql.exec(
          "INSERT INTO player_guess (id, player_id, song_idx, guess, score) VALUES (?, ?, ?, ?, ?)",
          id,
          message.senderId,
          message.player.songIdx,
          message.player.id,
          message.player.score,
        );
        this.ctx.storage.sql.exec(
          "UPDATE players SET score = score + ?, current_song_idx = ? WHERE id = ?",
          message.player.score,
          message.player.songIdx + 1,
          message.senderId,
        );
        if (message.player.id === "timeout") {
          const players = this.fetchPlayersFromDb();
          this.broadcast(
            responseSchema.parse({
              type: "player_update_response",
              payload: players,
            }),
          );
        }
        break;
      }
      case "reveal_theme": {
        const players = this.fetchPlayersFromDb();
        this.broadcast(
          responseSchema.parse({
            type: "reveal_theme_response",
            payload: players,
          }),
        );
        break;
      }
      case "ping": {
        this.broadcast({
          type: "pong",
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case "client_chat_message": {
        const senderId = message.senderId;
        // Basic XSS sanitization: replace < and >. For more robust sanitization, a library would be needed.
        const sanitizedText = message.payload.text
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const player = this.ctx.storage.sql
          .exec("SELECT name FROM players WHERE id = ?", senderId)
          .one() as { name: string } | null;
        const senderName = player?.name || "Unknown Player";

        const messageId = ulid();
        const timestamp = Date.now();

        this.ctx.storage.sql.exec(
          "INSERT INTO chat_messages (id, player_id, player_name, text, message_type, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
          messageId,
          senderId,
          senderName,
          sanitizedText,
          "player",
          timestamp,
        );

        const chatResponse = responseSchema.parse({
          type: "server_chat_broadcast",
          payload: {
            messageId,
            senderId,
            senderName,
            text: sanitizedText,
            timestamp,
            chatMessageType: "player",
          },
        });
        this.broadcast(chatResponse);
        break;
      }
      case "delete_do": {
        this.ctx
          .getWebSockets()
          .forEach((socket) => socket.close(1011, "Game closed"));
        await this.ctx.storage.deleteAll();
        await this.ctx.storage.deleteAlarm();
        break;
      }
      default:
        console.error("Received unknown message type:", message);
        ws.close(1011, "Unknown message type");
    }
  }

  webSocketClose(ws: WebSocket) {
    const attachment = ws.deserializeAttachment();
    if (attachment && attachment.id) {
      try {
        this.ctx.storage.sql.exec(
          "UPDATE players SET online = FALSE WHERE id = ?",
          attachment.id,
        );
      } catch (err) {}
    }
  }

  async alarm() {
    console.log("Alarm triggered, clearing DB and closing Durable Object.");
    this.getWebSockets().forEach((socket) => {
      socket.close(1011, "Game closed");
    });
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.deleteAlarm();
  }

  private getWebSockets() {
    return this.ctx.getWebSockets().filter((socket) => socket.readyState === 1);
  }

  private initializeStorage(): void {
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT, current_song_idx INTEGER, score INTEGER DEFAULT 0, avatar TEXT, is_ready BOOLEAN DEFAULT FALSE, online BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS game_info (id TEXT PRIMARY KEY, songs TEXT, game_started BOOLEAN DEFAULT FALSE, game_finished BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS player_guess (id TEXT PRIMARY KEY, player_id TEXT, song_idx INTEGER, guess TEXT, score INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, player_id TEXT, player_name TEXT, text TEXT, message_type TEXT CHECK(message_type IN ('player', 'system', 'game_event')), timestamp INTEGER, FOREIGN KEY (player_id) REFERENCES players(id))",
    );
  }

  private fetchPlayersFromDb() {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT id, name, score, avatar, current_song_idx, is_ready FROM players ORDER BY created_at ASC",
    );
    type Player = {
      id: string;
      name: string;
      score: number;
      avatar: string | null;
      isHost: boolean;
      isReady: boolean;
      songIdx: number;
    };
    const players = cursor.toArray() as any[];
    return players.map((player, idx) => ({
      ...player,
      songIdx: player.current_song_idx ?? 0,
      avatar: player.avatar ?? undefined,
      isReady: !!player.is_ready,
      isHost: idx === 0,
    })) as Player[];
  }

  private isHost(ws: WebSocket) {
    const attachment = ws.deserializeAttachment();
    if (!attachment || !attachment.id) {
      return false;
    }
    const player = this.ctx.storage.sql
      .exec(
        "SELECT id FROM players WHERE online = TRUE ORDER BY created_at ASC LIMIT 1",
      )
      .one() as { id: string };
    return player?.id === attachment.id;
  }

  private storePlayerInfo(
    ws: WebSocket,
    { id, name }: { id: string; name: string },
  ) {
    this.ctx.storage.sql.exec(
      "UPDATE players SET online = TRUE WHERE id = ?",
      id,
    );
    this.ctx.storage.sql.exec(
      "INSERT OR IGNORE INTO players (id, name, score, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      id,
      name,
      0,
    );
    ws.serializeAttachment({ id });
  }

  private storeGameInfo(songs: any[]) {
    this.ctx.storage.sql.exec(
      "INSERT INTO game_info (id, songs) VALUES (?, ?)",
      ulid(),
      JSON.stringify(songs),
    );
  }

  private getGameInfo() {
    const [gameInfo] = this.ctx.storage.sql
      .exec("SELECT * FROM game_info")
      .toArray() as {
      id: string;
      game_started: 0 | 1;
      game_finished: 0 | 1;
      songs: string;
    }[];
    if (!gameInfo) {
      return null;
    }
    return gameInfo;
  }

  private broadcast(message: object): void {
    const serializedMessage = JSON.stringify(message);
    this.getWebSockets().forEach((socket) => {
      socket.send(serializedMessage);
    });
  }
}

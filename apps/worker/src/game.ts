import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";
import type { Player } from "@repo/shared/types";
import { messageSchema, responseSchema } from "@repo/shared/schemas/game";

export class Game extends DurableObject<Bindings> {
  // sessions: Map<WebSocket, string> = new Map();
  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env);
    this.initializeStorage();
    // this.ctx.getWebSockets().forEach((socket) => {
    //   const metadata = socket.deserializeAttachment();
    //   this.sessions.set(socket, metadata.id);
    // });
  }

  private initializeStorage(): void {
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT, score INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
  }

  private fetchPlayersFromDb() {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT id, name, score FROM players ORDER BY created_at ASC",
    );
    const results = cursor.toArray();
    return (results as { id: string; name: string; score: number }[]) || [];
  }

  private fetchHostId(): string | null {
    const statement = "SELECT id FROM players ORDER BY created_at ASC LIMIT 1";
    const queryResults = this.ctx.storage.sql.exec(statement);
    const player = queryResults.one() as { id: string };

    if (player) {
      return player.id;
    }
    return null;
  }

  async fetch(request: Request) {
    console.log("Fetching game DO:", request.url);
    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, messageData: string | ArrayBuffer) {
    if (typeof messageData !== "string") {
      console.error("Received non-string WebSocket message:", messageData);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
      );
      return;
    }

    const message = messageSchema.parse(JSON.parse(messageData));
    switch (message.type) {
      case "player_join": {
        const { id, name } = message.payload;
        if (!id || !name) {
          console.error(
            "Invalid player_join message payload:",
            message.payload,
          );
          ws.close(1011, "Invalid player_join payload");
          return;
        }

        this.ctx.storage.sql.exec(
          "INSERT OR IGNORE INTO players (id, name, score, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
          id,
          name,
          0,
        );
        ws.serializeAttachment({ id });
        // this.sessions.set(ws, id);

        const currentPlayers = this.fetchPlayersFromDb().map((player, idx) => ({
          ...player,
          isHost: idx === 0,
        }));
        const response = JSON.stringify(
          responseSchema.parse({
            type: "player_join_response",
            payload: currentPlayers,
          }),
        );
        this.getWebSockets().forEach((socket) => {
          socket.send(response);
        });
        break;
      }
      case "game_start": {
        const attachment = ws.deserializeAttachment();
        if (!attachment || !attachment.id) {
          console.error("No attachment or attachment ID:", attachment);
          ws.close(1011, "Player not properly joined");
          return;
        }
        const hostId = this.fetchHostId();
        if (!hostId) {
          console.error("No game master found (no players in the game).");
          ws.close(1011, "No game master found");
          return;
        }
        if (attachment.id !== hostId) {
          console.error("Player not authorized to start the game:", attachment);
          ws.close(1011, "Only the game master can start the game.");
          return;
        }

        const response = JSON.stringify(
          responseSchema.parse({
            type: "game_start_response",
          }),
        );
        this.getWebSockets().forEach((socket) => {
          socket.send(response);
        });
        break;
      }
      case "ping": {
        this.getWebSockets().forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
        });
        break;
      }
      default:
        console.error("Received unknown message type:", message);
        ws.close(1011, "Unknown message type");
    }
  }

  getWebSockets() {
    return this.ctx.getWebSockets().filter((socket) => socket.readyState === 1);
  }

  async webSocketClose(ws: WebSocket) {
    ws.close(1011, "Game closed");
    if (this.getWebSockets().length === 0) {
      console.log(
        "All players disconnected, clearing DB and closing Durable Object.",
      );
      this.ctx.storage.deleteAll();
      this.ctx.storage.deleteAlarm();
    }
  }
}

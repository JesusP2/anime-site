import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";
import type { Player } from "@repo/shared/types";
import { messageSchema, responseSchema } from "@repo/shared/schemas/game";

export class Game extends DurableObject<Bindings> {
  private players: Player[] = [];
  private sessions: Map<WebSocket, string> = new Map();

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
      return;
    }

    try {
      const message = messageSchema.parse(JSON.parse(messageData));
      switch (message.type) {
        case "player_join": {
          const { id, name } = message.payload;
          if (!id || !name) {
            console.error(
              "Invalid player_join message payload:",
              message.payload,
            );
            return;
          }
          const existingPlayer = this.players.find((p) => p.id === id);
          if (!existingPlayer) {
            this.players.push({ id, name, score: 0 });
          }
          this.sessions.set(ws, id);
          const response = JSON.stringify(
            responseSchema.parse({
              type: "player_join_response",
              payload: this.players,
            }),
          );
          this.ctx.getWebSockets().forEach((socket) => {
            socket.send(response);
          });
          break;
        }
        case "game_start": {
          this.broadcastGameStart();
          const response = JSON.stringify(
            responseSchema.parse({
              type: "game_start_response",
            }),
          );
          this.ctx.getWebSockets().forEach((socket) => {
            socket.send(response);
          });
          break;
        }
        case "ping": {
          this.ctx.getWebSockets().forEach((socket) => {
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
      }
    } catch (error) {
      console.error(
        "Failed to parse WebSocket message or handle it:",
        error,
        messageData,
      );
    }
  }

  async webSocketClose(
    ws: WebSocket,
    // code: number,
    // reason: string,
    // wasClean: boolean,
  ) {
    const playerId = this.sessions.get(ws);
    if (playerId) {
      this.players = this.players.filter((p) => p.id !== playerId);
      this.sessions.delete(ws);
      this.broadcastPlayerUpdate();
    }
  }

  private broadcastPlayerUpdate() {
    const updateMsg = JSON.stringify({
      type: "player_update",
      players: this.players,
    });
    this.ctx.getWebSockets().forEach((socket) => {
      socket.send(updateMsg);
    });
  }

  private broadcastGameStart() {
    const startMsg = JSON.stringify(
      responseSchema.parse({ type: "game_start" }),
    );
    this.ctx.getWebSockets().forEach((socket) => {
      socket.send(startMsg);
    });
  }
}

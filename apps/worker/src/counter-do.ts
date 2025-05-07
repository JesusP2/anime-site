import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";
import type { Player } from "@repo/shared";

export class Game extends DurableObject<Bindings> {
  private players: Player[] = [];
  private sessions: Map<WebSocket, string> = new Map();

  async fetch(request: Request) {
    console.log("Fetching counter DO:", request.url);
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
      const message = JSON.parse(messageData);
      console.log("DO received message: ", message);

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
          } else {
            // Optionally update existing player's name or reset score if rejoining
            existingPlayer.name = name;
          }
          this.sessions.set(ws, id);
          this.broadcastPlayerUpdate();
          break;
        }
        case "start_game": {
          this.broadcastGameStart();
          break;
        }
        case "ping": {
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
          break;
        }
        default:
          console.log("Received unknown message type:", message.type);
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
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    const playerId = this.sessions.get(ws);
    if (playerId) {
      this.players = this.players.filter((p) => p.id !== playerId);
      this.sessions.delete(ws);
      this.broadcastPlayerUpdate();
    }
    console.log(
      `WebSocket closed for player ${playerId || "unknown"}:`,
      code,
      reason,
      wasClean,
    );
    // ws.close(code, "Durable Object is closing WebSocket"); // Runtime handles actual close
  }

  private broadcastPlayerUpdate() {
    const updateMsg = JSON.stringify({
      type: "player_update",
      players: this.players,
    });
    console.log("Broadcasting player_update:", this.players);
    this.ctx.getWebSockets().forEach((socket) => {
      try {
        socket.send(updateMsg);
      } catch (e) {
        console.error(
          "Failed to send to a websocket, attempting to close it:",
          e,
        );
        // If send fails, the socket might be dead, try to close it.
        // This might be redundant if webSocketClose is reliably called.
        try {
          socket.close(1011, "Send failed");
        } catch (closeError) {
          console.error("Failed to close dead websocket:", closeError);
        }
      }
    });
  }

  private broadcastGameStart() {
    const startMsg = JSON.stringify({ type: "game_start" });
    console.log("Broadcasting game_start");
    this.ctx.getWebSockets().forEach((socket) => {
      try {
        socket.send(startMsg);
      } catch (e) {
        console.error(
          "Failed to send to a websocket, attempting to close it:",
          e,
        );
        try {
          socket.close(1011, "Send failed");
        } catch (closeError) {
          console.error("Failed to close dead websocket:", closeError);
        }
      }
    });
  }
}

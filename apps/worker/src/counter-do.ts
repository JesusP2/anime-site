import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";

export class Game extends DurableObject<Bindings> {
  async fetch(request: Request) {
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
    // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
    // the connection is open. During periods of inactivity, the Durable Object can be evicted
    // from memory, but the WebSocket connection will remain open. If at some later point the
    // WebSocket receives a message, the runtime will recreate the Durable Object
    // (run the `constructor`) and deliver the message to the appropriate handler.
    this.ctx.acceptWebSocket(webSocketPair[1]);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws, message) {
    // Upon receiving a message from the client, reply with the same message,
    // but will prefix the message with "[Durable Object]: " and return the
    // total number of connections.
    ws.send(
      `[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`,
    );
  }

  async webSocketClose(ws, code, reason, wasClean) {
    // If the client closes the connection, the runtime will invoke the webSocketClose() handler.
    ws.close(code, "Durable Object is closing WebSocket");
  }
}

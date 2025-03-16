import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server as WebSocketServer } from "ws";

const app = new Hono();

// Basic route for health check
app.get("/", (c) => c.text("WebSocket Server is running"));

// Start the HTTP server
const PORT = process.env.PORT || 3001;

const server = serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`Server is running on http://localhost:${PORT}`);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("WebSocket connection established");
  clients.add(ws);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server",
    }),
  );

  ws.on("message", (message) => {
    console.log("Received message:", message.toString());
    try {
      const data = JSON.parse(message.toString());

      // Handle different message types
      switch (data.type) {
        case "join":
          console.log(`User joined: ${data.username}`);
          ws.send(
            JSON.stringify({
              type: "joined",
              username: data.username,
            }),
          );
          break;

        case "chat":
          console.log(`Chat message: ${data.message}`);
          // Broadcast to all clients
          broadcast({
            type: "chat",
            username: data.username,
            message: data.message,
          });
          break;

        default:
          console.log("Unknown message type:", data.type);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            }),
          );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      );
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(messageStr);
    }
  });
}

export default {
  fetch: app.fetch,
};

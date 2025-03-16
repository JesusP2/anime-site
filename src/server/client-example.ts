// This is just a test client to demonstrate WebSocket usage
// Note: This client is meant to be run in a browser environment
// For Node.js testing, you would need to use a WebSocket client library

function connectWebSocket() {
  const ws = new WebSocket("ws://localhost:3001");

  ws.onopen = () => {
    console.log("Connected to WebSocket server");

    // Join example
    ws.send(
      JSON.stringify({
        type: "join",
        username: "TestUser",
      }),
    );

    // Send a chat message after 2 seconds
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          type: "chat",
          username: "TestUser",
          message: "Hello, WebSocket server!",
        }),
      );
    }, 2000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received from server:", data);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  ws.onclose = (event) => {
    console.log(
      `WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`,
    );
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
}

// For Node.js environment testing
if (typeof window === "undefined") {
  console.log("This client example is meant for browser environments.");
  console.log('For Node.js testing, use a WebSocket client library like "ws".');
}

export { connectWebSocket };

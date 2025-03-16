import * as React from "react";
import { WaitingRoom } from "./waiting-room";
import { PlayMultiplayer } from "./play-multiplayer";
import { Leaderboard } from "./leaderboard";
import { toast } from "@/hooks/use-toast";

// Mock WebSocket for demo purposes
class MockWebSocket {
  onmessage: ((event: any) => void) | null = null;

  constructor(url: string) {
    // Simulate connection
    console.log(`Connecting to ${url}`);

    // Simulate players joining
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: "PLAYER_JOINED",
            payload: {
              id: "player2",
              name: "Player 2",
              isHost: false,
            },
          }),
        });
      }
    }, 2000);
  }

  send(data: string) {
    const parsedData = JSON.parse(data);
    console.log("Mock sending:", parsedData);

    // Simulate responses
    if (parsedData.type === "START_GAME") {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: "GAME_STARTED",
              payload: {},
            }),
          });
        }
      }, 500);
    }
  }

  close() {
    console.log("Closing connection");
  }
}

type GameState = "waiting" | "playing" | "results";

type Player = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  score: number;
};

export function GameManager({
  gameId,
  quizId,
  quizTitle,
  themes,
}: {
  gameId: string;
  quizId: string;
  quizTitle: string;
  themes: Array<{
    id: string;
    title: string | null;
    animeTitle: string;
    url: string[];
  }>;
}) {
  const [gameState, setGameState] = React.useState<GameState>("waiting");
  const [players, setPlayers] = React.useState<Player[]>([
    { id: "currentUser", name: "You", isHost: true, score: 0 },
  ]);
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; score: number }>
  >([]);
  const socketRef = React.useRef<MockWebSocket | null>(null);

  React.useEffect(() => {
    // Set up WebSocket connection
    const socket = new MockWebSocket(`ws://example.com/game/${gameId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "PLAYER_JOINED":
            toast({
              title: "Player joined",
              description: `${data.payload.name} has joined the game`,
            });
            setPlayers((prev) => [...prev, { ...data.payload, score: 0 }]);
            break;

          case "PLAYER_LEFT":
            toast({
              title: "Player left",
              description: `${data.payload.name} has left the game`,
              variant: "destructive",
            });
            setPlayers((prev) => prev.filter((p) => p.id !== data.payload.id));
            break;

          case "GAME_STARTED":
            setGameState("playing");
            break;

          case "PLAYER_ANSWER":
            // Update player scores
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === data.payload.playerId
                  ? { ...p, score: p.score + data.payload.points }
                  : p,
              ),
            );
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [gameId]);

  const handleStartGame = () => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "START_GAME" }));
    }
  };

  const handleGameComplete = (gameResults: any) => {
    setResults(gameResults);
    setGameState("results");

    // Send game results to server
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "GAME_COMPLETE",
          payload: { results: gameResults },
        }),
      );
    }
  };

  const handlePlayAgain = () => {
    // Reset game state
    setGameState("waiting");
    setPlayers(players.map((p) => ({ ...p, score: 0 })));

    // Notify server
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "PLAY_AGAIN",
        }),
      );
    }
  };

  switch (gameState) {
    case "waiting":
      return (
        <WaitingRoom
          gameId={gameId}
          quizTitle={quizTitle}
          players={players}
          isHost={players.find((p) => p.id === "currentUser")?.isHost || false}
          onStartGame={handleStartGame}
        />
      );

    case "playing":
      return (
        <PlayMultiplayer
          gameId={gameId}
          quizTitle={quizTitle}
          players={players}
          currentPlayerId="currentUser"
          themes={themes}
          onGameComplete={handleGameComplete}
        />
      );

    case "results":
      return (
        <Leaderboard
          gameId={gameId}
          quizTitle={quizTitle}
          results={results}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}
import * as React from "react";
import { WaitingRoom } from "./waiting-room";
import { PlayMultiplayer } from "./play-multiplayer";
import { Leaderboard } from "./leaderboard";
import { toast } from "@/hooks/use-toast";

// Mock WebSocket for demo purposes
class MockWebSocket {
  onmessage: ((event: any) => void) | null = null;

  constructor(url: string) {
    // Simulate connection
    console.log(`Connecting to ${url}`);

    // Simulate players joining
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: "PLAYER_JOINED",
            payload: {
              id: "player2",
              name: "Player 2",
              isHost: false,
            },
          }),
        });
      }
    }, 2000);
  }

  send(data: string) {
    const parsedData = JSON.parse(data);
    console.log("Mock sending:", parsedData);

    // Simulate responses
    if (parsedData.type === "START_GAME") {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: "GAME_STARTED",
              payload: {},
            }),
          });
        }
      }, 500);
    }
  }

  close() {
    console.log("Closing connection");
  }
}

type GameState = "waiting" | "playing" | "results";

type Player = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  score: number;
};

export function GameManager({
  gameId,
  quizId,
  quizTitle,
  themes,
}: {
  gameId: string;
  quizId: string;
  quizTitle: string;
  themes: Array<{
    id: string;
    title: string | null;
    animeTitle: string;
    url: string[];
  }>;
}) {
  const [gameState, setGameState] = React.useState<GameState>("waiting");
  const [players, setPlayers] = React.useState<Player[]>([
    { id: "currentUser", name: "You", isHost: true, score: 0 },
  ]);
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; score: number }>
  >([]);
  const socketRef = React.useRef<MockWebSocket | null>(null);

  React.useEffect(() => {
    // Set up WebSocket connection
    const socket = new MockWebSocket(`ws://example.com/game/${gameId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "PLAYER_JOINED":
            toast({
              title: "Player joined",
              description: `${data.payload.name} has joined the game`,
            });
            setPlayers((prev) => [...prev, { ...data.payload, score: 0 }]);
            break;

          case "PLAYER_LEFT":
            toast({
              title: "Player left",
              description: `${data.payload.name} has left the game`,
              variant: "destructive",
            });
            setPlayers((prev) => prev.filter((p) => p.id !== data.payload.id));
            break;

          case "GAME_STARTED":
            setGameState("playing");
            break;

          case "PLAYER_ANSWER":
            // Update player scores
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === data.payload.playerId
                  ? { ...p, score: p.score + data.payload.points }
                  : p,
              ),
            );
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [gameId]);

  const handleStartGame = () => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "START_GAME" }));
    }
  };

  const handleGameComplete = (gameResults: any) => {
    setResults(gameResults);
    setGameState("results");

    // Send game results to server
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "GAME_COMPLETE",
          payload: { results: gameResults },
        }),
      );
    }
  };

  const handlePlayAgain = () => {
    // Reset game state
    setGameState("waiting");
    setPlayers(players.map((p) => ({ ...p, score: 0 })));

    // Notify server
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "PLAY_AGAIN",
        }),
      );
    }
  };

  switch (gameState) {
    case "waiting":
      return (
        <WaitingRoom
          gameId={gameId}
          quizTitle={quizTitle}
          players={players}
          isHost={players.find((p) => p.id === "currentUser")?.isHost || false}
          onStartGame={handleStartGame}
        />
      );

    case "playing":
      return (
        <PlayMultiplayer
          gameId={gameId}
          quizTitle={quizTitle}
          players={players}
          currentPlayerId="currentUser"
          themes={themes}
          onGameComplete={handleGameComplete}
        />
      );

    case "results":
      return (
        <Leaderboard
          gameId={gameId}
          quizTitle={quizTitle}
          results={results}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}

import * as React from "react";
import { SoloGameView } from "./solo-game-view";
import type { Player } from "./types";
import { WaitingRoom } from "./waiting-room";
import { MultiPlayerGameView } from "./multiplayer-game-view";

type GameState = "waiting" | "solo-game" | "multiplayer-game" | "results";

type Props = {
  gameId: string;
  gameType: string;
  title: string;
  description: string;
  difficulty: string;
  public: boolean;
};

export function GameManager(props: Props) {
  const [gameState, setGameState] = React.useState<GameState>("waiting");
  const [players, _] = React.useState<Player[]>([
    { id: "currentUser", name: "You", isHost: true, score: 0 },
  ]);
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; score: number }>
  >([]);

  function handleStartGame() {
    const isSoloGame = players.length === 1;
    setGameState(isSoloGame ? "solo-game" : "multiplayer-game");
  }

  function handleGameComplete() {
    // Convert players to results format
    const gameResults = players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
    }));

    setResults(gameResults);
    setGameState("results");
  }

  switch (gameState) {
    case "waiting":
      return (
        <WaitingRoom
          quizTitle={props.title}
          players={players}
          isHost={players.find((p) => p.id === "currentUser")?.isHost || false}
          onStartGame={handleStartGame}
        />
      );

    case "solo-game":
      return (
        <SoloGameView
          gameId={props.gameId}
          quizTitle={props.title}
          players={players}
          currentPlayerId="currentUser"
          onGameComplete={handleGameComplete}
        />
      );

    case "multiplayer-game":
      return (
        <MultiPlayerGameView
          quizTitle={props.title}
          players={players}
          currentPlayerId="currentUser"
          onGameComplete={handleGameComplete}
        />
      );

    case "results":
      return <ResultView quizTitle={props.title} results={results} />;

    default:
      return null;
  }
}

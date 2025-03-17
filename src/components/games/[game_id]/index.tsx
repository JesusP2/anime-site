import * as React from "react";

type GameState = "waiting" | "solo-game" | "multiplayer-game" | "results";

type Player = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  score: number;
};

type Props = {
  gameType: string;
  title: string;
  description: string;
  difficulty: string;
  public: boolean;
}

export function GameManager(props: Props) {
  const [gameState, setGameState] = React.useState<GameState>("waiting");
  const [players, setPlayers] = React.useState<Player[]>([
    { id: "currentUser", name: "You", isHost: true, score: 0 },
  ]);
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; score: number }>
  >([]);

  function handleStartGame() {
    // TODO:
  }

  function handleGameComplete() {
    // TODO:
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
      return (
        <ResultView
          quizTitle={props.title}
          results={results}
        />
      );

    default:
      return null;
  }
}

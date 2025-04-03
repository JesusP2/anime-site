import * as React from "react";
import { SoloGameView } from "./solo-game-view";
import type { Player } from "./types";
import { WaitingRoom } from "./waiting-room";
import { MultiPlayerGameView } from "./multiplayer-game-view";
import { ResultView } from "./result-view";
import type { GameState, GameType, Song } from "@/lib/types";
import { useUser } from "@/hooks/use-user";
import type { User } from "better-auth";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  gameType: GameType;
  songs: Song[];
  host: User | null;
  title: string;
  description: string;
  difficulty: string;
  public: boolean;
};

export function GameManager(props: Props) {
  const [gameState, setGameState] = React.useState<GameState>("waiting");
  const currentUser = useUser(props.host);
  // TODO: get this list from the server
  const [players, setPlayers] = React.useState<Player[]>(
    currentUser.isLoading
      ? []
      : [
          {
            id: currentUser.user.id,
            name: currentUser.user.name,
            isHost: true,
            score: 0,
          },
        ],
  );
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; score: number }>
  >([]);

  function handleStartGame() {
    setGameState(props.gameType);
  }

  function handleGameComplete(data: { id: string; score: number }) {
    console.log("handleGameComplete");
    setResults([
      {
        id: currentUser.user?.id,
        name: currentUser.user?.name,
        score: data.score,
      },
    ]);
    setGameState("results");
  }

  // TODO: this should be done on the server
  React.useEffect(() => {
    if (!players.length && !currentUser.isLoading) {
      setPlayers([
        {
          id: currentUser.user.id,
          name: currentUser.user.name,
          isHost: true,
          score: 0,
        },
      ]);
    }
  }, [currentUser]);

  if (currentUser.isLoading) {
    return <div>Loading...</div>;
  }

  switch (gameState) {
    case "waiting":
      return (
        <>
          <WaitingRoom
            quizTitle={props.title}
            quizDescription={props.description}
            players={players}
            isHost={
              players.find((p) => p.id === currentUser.user?.id)?.isHost ||
              false
            }
            gameType={props.gameType}
            onStartGame={handleStartGame}
          />
          <Toaster />
        </>
      );

    case "solo":
      return (
        <>
          <SoloGameView
            songs={props.songs}
            players={players}
            currentPlayerId={currentUser.user?.id}
            onGameComplete={handleGameComplete}
          />

          <Toaster />
        </>
      );

    case "multiplayer":
      return (
        <>
          <MultiPlayerGameView
            quizTitle={props.title}
            players={players}
            currentPlayerId={currentUser.user?.id}
            onGameComplete={handleGameComplete}
          />

          <Toaster />
        </>
      );

    case "results":
      return (
        <>
          <ResultView quizTitle={props.title} results={results} />
          <Toaster />
        </>
      );

    default:
      return null;
  }
}

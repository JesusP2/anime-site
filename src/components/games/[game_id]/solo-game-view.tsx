import { useState, useEffect } from "react";
import { SongAutocomplete } from "@/components/song-autocomplete";
import type { Player } from "./types";
import { cn } from "@/lib/utils";
import type { GameManagerProps, GameState } from "@/lib/types";
import { WaitingRoom } from "./waiting-room";
import { ResultView } from "./result-view";
import { Toaster } from "@/components/ui/sonner";

const TIMEOUT = 5;
export function SinglePlayer(props: GameManagerProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [player, setPlayer] = useState(
    {
      id: props.currentPlayer.id,
      name: props.currentPlayer.name,
      score: 0,
    },
  );

  function handleStartGame() {
    setGameState("playing");
  }

  function handleGameComplete() {
    setGameState("results");
  }

  if (gameState === "waiting") {
    return (
      <>
        <WaitingRoom
          quizTitle={props.title}
          quizDescription={props.description}
          players={[player]}
          isHost={player.id === props.host.id}
          gameType="solo"
          onStartGame={handleStartGame}
        />
        <Toaster />
      </>
    )
  } else if (gameState === "playing") {
    return (
      <>
        <SinglePlayerGame
          songs={props.songs}
          player={player}
          setPlayer={setPlayer}
          handleGameComplete={handleGameComplete}
        />
        <Toaster />
      </>
    )
  } else if (gameState === "results") {
    return (
      <>
        <ResultView
          quizTitle={props.title}
          results={[]}
        />
        <Toaster />
      </>
    )
  }
  return null;
}

export function SinglePlayerGame({
  songs,
  player,
  setPlayer,
  handleGameComplete,
}: {
  songs: GameManagerProps['songs'];
  player: Player;
  setPlayer: (player: Player) => void;
  handleGameComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT * 2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [songIdx, setSongIdx] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const currentSong = songs[songIdx];

  useEffect(() => {
    if (!videoReady) return;
    
    const timer = setInterval(() => {
      const newTimeLeft = timeLeft - 1;
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        handleNextTheme();
        return;
      }
      if (newTimeLeft <= TIMEOUT && isPlaying) {
        handleTimerEnd();
      }
      setTimeLeft(newTimeLeft);
    }, 1_000);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, timeLeft, videoReady]);

  const handleTimerEnd = () => {
    setIsPlaying(false);
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    setIsPlaying(false);
    const isCorrect = item.key === currentSong?.id;
    if (isCorrect) {
      setPlayer({ ...player, score: player.score + timeLeft });
    }
  };

  const handleNextTheme = async () => {
    if (songIdx >= songs.length - 1) {
      handleGameComplete();
      return;
    }
    setSongIdx(songIdx + 1);
    setIsPlaying(true);
    setTimeLeft(TIMEOUT * 2);
    setVideoReady(false);
  };

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mb-8 w-full h-full">
      <div className="h-[6rem] text-center py-2">
        {songIdx + 1} / {songs.length} - {timeLeft} - {timeLeft - TIMEOUT}
        {!isPlaying && (
          <>
            <h1 className="text-x3 text-center">{currentSong?.animeName}</h1>
            <h1 className="text-x3 text-center">{currentSong?.name}</h1>
          </>
        )}
      </div>
      <div className="w-full h-[calc(100%-20rem)]">
        <div className="relative h-full w-full">
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-full bg-black text-3xl grid place-items-center z-10",
              isPlaying ? "opacity-100" : "hidden",
            )}
          >
            {!videoReady ? (
              <div>Loading video...</div>
            ) : timeLeft - TIMEOUT === 0 ? (
              <div>The answer is...</div>
            ) : (
              timeLeft - TIMEOUT
            )}
          </div>
          <video
            src={currentSong?.url}
            autoPlay
            muted={false}
            controls
            className="w-full h-full"
            style={{ display: "block" }}
            onCanPlay={handleVideoReady}
          ></video>
        </div>
      </div>
      <div className="h-[6rem]">
        <div className="mt-4 w-[90%] mx-auto">
          <SongAutocomplete
            ignoreThemes={[]}
            disabled={!isPlaying || !videoReady}
            onSelectedValueChange={handleGuess}
          />
        </div>
      </div>
    </div>
  );
}
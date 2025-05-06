import { useState, useEffect } from "react";
import { SongAutocomplete } from "@/components/song-autocomplete";
import type { Player } from "./types";
import { cn } from "@/lib/utils";
import type { GameManagerProps, GameState } from "@/lib/types";
import { WaitingRoom } from "./waiting-room";
import { ResultView } from "./result-view";

const TIMEOUT = 10;
export function MultiPlayer(props: GameManagerProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [player, setPlayer] = useState({
    id: props.currentPlayer.id,
    name: props.currentPlayer.name,
    score: 0,
  });

  function handleStartGame() {
    setGameState("playing");
  }

  function handleGameComplete() {
    setGameState("results");
  }

  if (gameState === "waiting") {
    return (
      <WaitingRoom
        quizTitle={props.title}
        quizDescription={props.description}
        players={[player]}
        isHost={player.id === props.host.id}
        gameType="solo"
        onStartGame={handleStartGame}
      />
    );
  } else if (gameState === "playing") {
    return (
      <MultiPlayerGame
        songs={props.songs}
        player={player}
        setPlayer={setPlayer}
        handleGameComplete={handleGameComplete}
      />
    );
  } else if (gameState === "results") {
    return <ResultView quizTitle={props.title} results={[player]} />;
  }
  return null;
}

export function MultiPlayerGame({
  songs,
  player,
  setPlayer,
  handleGameComplete,
}: {
  songs: GameManagerProps["songs"];
  player: Player;
  setPlayer: (player: Player) => void;
  handleGameComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT * 2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [songIdx, setSongIdx] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<{
    id: string;
    name: string;
    correct: boolean;
  } | null>(null);
  const [songResults, setSongResults] = useState<
    Array<{ songId: string; correct: boolean; pointsEarned: number }>
  >([]);
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
    const isCorrect = item.key === currentSong?.themeId;
    const pointsEarned = isCorrect ? 1 : 0;

    setCurrentAnswer({ id: item.key, correct: isCorrect, name: item.label });

    if (isCorrect) {
      setPlayer({ ...player, score: player.score + pointsEarned });
    }

    // Record the result for this song
    setSongResults([
      ...songResults,
      {
        songId: currentSong?.id || "",
        correct: isCorrect,
        pointsEarned,
      },
    ]);
  };

  const handleNextTheme = async () => {
    if (songIdx >= songs.length - 1) {
      handleGameComplete();
      return;
    }

    // If there's no answer for the current song, record it as a timeout/skip
    if (!currentAnswer) {
      setSongResults((prev) => [
        ...prev,
        {
          songId: currentSong?.id ?? "",
          correct: false,
          pointsEarned: 0,
        },
      ]);
    }

    setSongIdx(songIdx + 1);
    setIsPlaying(true);
    setTimeLeft(TIMEOUT * 2);
    setVideoReady(false);
    setCurrentAnswer(null);
  };

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mb-8 w-full h-full flex flex-col">
      <div className="min-h-[6rem] text-center py-2 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="text-left">
            <span className="font-bold">Song</span>: {songIdx + 1} /{" "}
            {songs.length}
          </div>
          <div className="text-right">
            <span className="font-bold">Score</span>: {player.score}
          </div>
        </div>
        {!isPlaying && (
          <div className="mt-2">
            {currentAnswer ? (
              <div
                className={`font-medium ${currentAnswer.correct ? "text-green-600" : "text-red-600"}`}
              >
                {currentAnswer.correct ? `Correct! +1 points` : "Incorrect!"}
              </div>
            ) : (
              <div className="font-medium text-ed-600">Time's up!</div>
            )}
            <h1 className="text-xl font-bold">
              {currentSong?.animeName} - {currentSong?.name}
            </h1>
          </div>
        )}
      </div>
      <div className="w-full flex-grow relative">
        <div className="relative w-full aspect-video">
          <div
            className={cn(
              "absolute inset-0 bg-black text-3xl grid place-items-center z-10",
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
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: "block" }}
            onCanPlay={handleVideoReady}
          ></video>
        </div>
      </div>
      <div className="h-[6rem] shrink-0">
        <div className="mt-4 w-[90%] mx-auto">
          <SongAutocomplete
            ignoreThemes={[]}
            disabled={!isPlaying || !videoReady || !!currentAnswer?.name}
            value={currentAnswer?.name ?? ""}
            onSelectedValueChange={handleGuess}
          />
        </div>
      </div>
    </div>
  );
}

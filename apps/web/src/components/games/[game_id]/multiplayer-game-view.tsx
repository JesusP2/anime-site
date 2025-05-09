import { useState, useEffect, useRef } from "react";
import { SongAutocomplete } from "@/components/song-autocomplete";
import { cn } from "@/lib/utils";
import type { GameManagerProps } from "@/lib/types";
import type { GameState, Player } from "@repo/shared/types";
import { messageSchema, responseSchema } from "@repo/shared/schemas/game";
import { WaitingRoom } from "./waiting-room";
import { ResultView } from "./result-view";

const TIMEOUT = 10;
export function MultiPlayer(props: GameManagerProps) {
  const [songIdx, setSongIdx] = useState(0);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [players, setPlayers] = useState<Player[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const isUserHost = players.find((p) => p.id === props.currentPlayer.id)?.isHost ?? false;

  useEffect(() => {
    const url = new URL('ws://localhost:8787/api/ws');
    url.searchParams.append('matchId', props.gameId);
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      const joinMessage = messageSchema.parse({
        type: "player_join",
        payload: {
          id: props.currentPlayer.id,
          name: props.currentPlayer.name,
          songs: props.songs,
        },
      });
      console.log('sending join message')
      socket.send(JSON.stringify(joinMessage));
    };

    ws.current.onmessage = onMessage;
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      ws.current = null;
    };
  }, [props.gameId]);

  // we need to update onmessage to handle songIdx changes
  useEffect(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.onmessage = onMessage;
  }, [songIdx])

  function onMessage(event: MessageEvent) {
    const message = responseSchema.safeParse(JSON.parse(event.data as string));
    if (!message.success) {
      console.error("Failed to parse WebSocket message:", message.error);
      return;
    }
    if (
      message.data.type === "player_join_response"
    ) {
      const currentPlayer = message.data.payload.find((p) => p.id === props.currentPlayer.id);
      if (currentPlayer && currentPlayer.songIdx > 0 && songIdx === 0) {
        setSongIdx(currentPlayer.songIdx)
      }
      setPlayers(message.data.payload);
    } else if (message.data.type === "game_start_response") {
      setGameState("playing");
    } else if (message.data.type === "pong") {
      console.log("Pong received");
    }
  }

  function handleStartGame() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && isUserHost) {
      const message = JSON.stringify(messageSchema.parse({ type: "game_start" }));
      ws.current.send(message);
    }
  }

  function handleGuess({ songIdx, guess, score }: { songIdx: number; guess: string; score: number }) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(messageSchema.parse({ type: "player_update", player: { songIdx, id: guess, score } }));
      ws.current.send(message);
    }
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
          players={players}
          isHost={players.find((p) => p.id === props.currentPlayer.id)?.isHost ?? false}
          gameType="multiplayer"
          onStartGame={handleStartGame}
        />
        {songIdx > 0 ? <button onClick={() => setGameState('playing')}>play</button> : <button onClick={() => setGameState('ready')}>ready</button>}
      </>
    );
  } else if (gameState === "playing") {
    return (
      <MultiPlayerGame
        songs={props.songs}
        handleGuess={handleGuess}
        currentPlayer={players.find((p) => p.id === props.currentPlayer.id)}
        handleGameComplete={handleGameComplete}
        songIdx={songIdx}
        setSongIdx={setSongIdx}
      />
    );
  } else if (gameState === "results") {
    return <ResultView quizTitle={props.title} results={players} />;
  }
  return null;
}

export function MultiPlayerGame({
  songs,
  currentPlayer,
  handleGuess: handleWsGuess,
  handleGameComplete,
  songIdx,
  setSongIdx,
}: {
  songs: GameManagerProps["songs"];
  currentPlayer?: Player;
  handleGuess: ({ songIdx, guess, score }: { songIdx: number; guess: string; score: number }) => void;
  handleGameComplete: () => void;
  songIdx: number;
  setSongIdx: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT * 2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<{
    id: string;
    name: string;
    correct: boolean;
  } | null>(null);
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
    if (!currentAnswer) {
      handleWsGuess({ songIdx, guess: 'timeout', score: 0 });
    }
    setIsPlaying(false);
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    const isCorrect = item.key === currentSong?.themeId;
    const pointsEarned = isCorrect ? 1 : 0;
    handleWsGuess({ songIdx, guess: item.key, score: pointsEarned });
    setCurrentAnswer({ id: item.key, correct: isCorrect, name: item.label });
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
            <span className="font-bold">Score</span>: {currentPlayer?.score || 0}
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

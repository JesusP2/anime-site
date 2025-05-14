import { useState, useEffect, useRef } from "react";
import { SongAutocomplete } from "@/components/song-autocomplete";
import { cn } from "@/lib/utils";
import type { GameManagerProps } from "@/lib/types";
import type { GameState, Player } from "@repo/shared/types";
import {
  messageSchema,
  responseSchema,
  serverChatBroadcastSchema,
} from "@repo/shared/schemas/game";
import { z } from "zod";
import { WaitingRoom } from "./waiting-room";
import { ResultView } from "./result-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatView } from "./chat-view";
import { WS_URL } from "astro:env/client";

const TIMEOUT = 20;

type ChatMessage = z.infer<typeof serverChatBroadcastSchema>["payload"];

export function MultiPlayer(props: GameManagerProps) {
  const [songIdx, setSongIdx] = useState(0);
  const [gameState, setGameState] = useState<GameState | "ready">("waiting");
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const isUserHost =
    players.find((p) => p.id === props.currentPlayer.id)?.isHost ?? false;
  const [showNotReadyMessage, setShowNotReadyMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const url = new URL(WS_URL);
    url.searchParams.append("matchId", props.gameId);
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      const joinMessage = messageSchema.parse({
        type: "player_join",
        senderId: props.currentPlayer.id,
        payload: {
          id: props.currentPlayer.id,
          name: props.currentPlayer.name,
          songs: props.songs,
        },
      });
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

  useEffect(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.onmessage = onMessage;
  }, [songIdx]);

  function onMessage(event: MessageEvent) {
    const message = responseSchema.safeParse(JSON.parse(event.data as string));
    if (!message.success) {
      console.error("Failed to parse WebSocket message:", message.error);
      return;
    }
    if (message.data.type === "player_join_response") {
      setIsJoining(false);
      setHasGameStarted(message.data.payload.hasGameStarted);
      const currentPlayer = message.data.payload.players.find(
        (p) => p.id === props.currentPlayer.id,
      );
      if (currentPlayer && currentPlayer.songIdx > props.songs.length - 1) {
        setGameState("results");
        setPlayers(message.data.payload.players);
        return;
      }
      if (currentPlayer && currentPlayer.songIdx > 0 && songIdx === 0) {
        setSongIdx(currentPlayer.songIdx);
      }
      setPlayers(message.data.payload.players);
    } else if (message.data.type === "game_start_response") {
      setGameState("playing");
    } else if (message.data.type === "player_update_response") {
      const messagePlayers = message.data.payload;
      setPlayers((players) =>
        players.map((p) => ({
          ...p,
          score: messagePlayers.find((p2) => p2.id === p.id)?.score ?? 0,
        })),
      );
    } else if (message.data.type === "reveal_theme_response") {
      const messagePlayers = message.data.payload;
      setPlayers((players) =>
        players.map((p) => ({
          ...p,
          score: messagePlayers.find((p2) => p2.id === p.id)?.score ?? 0,
        })),
      );
    } else if (message.data.type === "players_not_ready_response") {
      setShowNotReadyMessage(true);
    } else if (message.data.type === "pong") {
      console.log("Pong received");
    } else if (message.data.type === "server_chat_broadcast") {
      const chatPayload = message.data.payload;
      setChatMessages((prevMessages) => [...prevMessages, chatPayload]);
    }
  }

  function handleStartGame() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && isUserHost) {
      const message = JSON.stringify(
        messageSchema.parse({
          type: "game_start",
          senderId: props.currentPlayer.id,
        }),
      );
      ws.current.send(message);
    }
  }

  function handleConfirmStartGame() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && isUserHost) {
      const message = JSON.stringify(
        messageSchema.parse({
          type: "force_game_start",
          senderId: props.currentPlayer.id,
        }),
      );
      ws.current.send(message);
    }
  }

  function handleGuess({
    songIdx,
    guess,
    score,
  }: {
    songIdx: number;
    guess: string;
    score: number;
  }) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(
        messageSchema.parse({
          type: "player_update",
          senderId: props.currentPlayer.id,
          player: { songIdx, id: guess, score },
        }),
      );
      ws.current.send(message);
    }
  }

  function handleRevealTheme() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(
        messageSchema.parse({
          type: "reveal_theme",
          senderId: props.currentPlayer.id,
        }),
      );
      ws.current.send(message);
    }
  }

  function handleGameComplete() {
    setGameState("results");
  }

  function handlePlayerReady() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(
        messageSchema.parse({
          type: "player_ready",
          senderId: props.currentPlayer.id,
        }),
      );
      ws.current.send(message);
    }
    setGameState("ready");
  }

  function handleDeleteGame() {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      import.meta.env.DEV
    ) {
      ws.current.send(
        JSON.stringify(
          messageSchema.parse({
            type: "delete_do",
            senderId: props.currentPlayer.id,
          }),
        ),
      );
    }
  }

  function handleSendChatMessage(text: string) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const chatMessage = messageSchema.parse({
        type: "client_chat_message",
        senderId: props.currentPlayer.id,
        payload: { text },
      });
      ws.current.send(JSON.stringify(chatMessage));
    }
  }

  if (gameState === "waiting" || gameState === "ready") {
    return (
      <>
        <div
          className={cn(
            "flex flex-col md:flex-row gap-4 p-4 py-2 mx-auto max-w-full",
          )}
        >
          <div className="md:w-full">
            <WaitingRoom
              challengeTitle={props.title}
              challengeDescription={props.description}
              players={players}
              isHost={
                players.find((p) => p.id === props.currentPlayer.id)?.isHost ??
                false
              }
              gameType="multiplayer"
              onStartGame={handleStartGame}
              onUserReady={handlePlayerReady}
              onResumeGame={() => setGameState("playing")}
              gameState={gameState}
              isJoining={isJoining}
              hasGameStarted={hasGameStarted}
              songIdx={songIdx}
            />
          </div>
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
          />
        </div>
        <Dialog
          open={showNotReadyMessage}
          onOpenChange={setShowNotReadyMessage}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Not All Players Are Ready</DialogTitle>
              <DialogDescription>
                Some players haven't marked themselves as ready. Are you sure
                you want to start the game anyway?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNotReadyMessage(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmStartGame}>
                Start Game Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {import.meta.env.DEV && (
          <button onClick={handleDeleteGame}>Delete Game</button>
        )}
      </>
    );
  } else if (gameState === "playing") {
    return (
      <div className="flex flex-col lg:flex-row gap-4 p-4 mx-auto h-full max-w-full">
        <div className="md:w-full">
          <MultiPlayerGame
            songs={props.songs}
            handleGuess={handleGuess}
            currentPlayer={players.find((p) => p.id === props.currentPlayer.id)}
            handleGameComplete={handleGameComplete}
            handleRevealTheme={handleRevealTheme}
            songIdx={songIdx}
            setSongIdx={setSongIdx}
          />
        </div>
        <ChatView
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
        />
      </div>
    );
  } else if (gameState === "results") {
    return (
      <>
        <div className="flex flex-col md:flex-row gap-4 p-4 mx-auto max-w-full">
          <div className="md:w-full mx-6">
            <ResultView challengeTitle={props.title} results={players} />
          </div>
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
          />
        </div>
        {import.meta.env.DEV && (
          <button onClick={handleDeleteGame}>Delete Game</button>
        )}
      </>
    );
  }
  return null;
}

export function MultiPlayerGame({
  songs,
  currentPlayer,
  handleGuess: handleWsGuess,
  handleGameComplete,
  handleRevealTheme,
  songIdx,
  setSongIdx,
}: {
  songs: GameManagerProps["songs"];
  currentPlayer?: Player;
  handleGuess: ({
    songIdx,
    guess,
    score,
  }: {
    songIdx: number;
    guess: string;
    score: number;
  }) => void;
  handleGameComplete: () => void;
  handleRevealTheme: () => void;
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
      handleWsGuess({ songIdx, guess: "timeout", score: 0 });
      setIsPlaying(false);
      return;
    }
    handleRevealTheme();
    setIsPlaying(false);
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    if (timeLeft - TIMEOUT < 0) {
      return;
    }
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
    <div className="mx-auto px-6 lg:px-0 w-full h-full flex flex-col max-w-full">
      <div className="text-center py-2 shrink-0">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-left">
            <span className="font-bold">Song</span>: {songIdx + 1} /{" "}
            {songs.length}
          </div>
          <div>
            {!isPlaying && (
              <>
                <h1 className="text-xl font-bold">
                  {currentSong?.animeName} - {currentSong?.name}
                  {currentAnswer ? (
                    <span
                      className={`font-medium ml-2 ${currentAnswer.correct ? "text-green-600" : "text-red-600"}`}
                    >
                      {currentAnswer.correct
                        ? `Correct! +1 points`
                        : "Incorrect!"}
                    </span>
                  ) : (
                    <span className="font-medium text-ed-600">Time's up!</span>
                  )}
                </h1>
              </>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold">Score</span>:{" "}
            {currentPlayer?.score || 0}
          </div>
        </div>
      </div>
      <div className="w-full relative max-w-6xl mx-auto">
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
        <div className="mt-4 mx-auto">
          <SongAutocomplete
            debounce={100}
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

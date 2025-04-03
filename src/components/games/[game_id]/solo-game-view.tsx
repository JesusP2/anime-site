import { useState, useEffect } from "react";
import { SongAutocomplete } from "@/components/song-autocomplete";
import type { Player } from "./types";
import { cn } from "@/lib/utils";
import type { Song } from "@/lib/types";

function embedUrl(_url?: string) {
  if (!_url) return "";
  const url = new URL(_url);
  const v = url.searchParams.get("v");
  return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1`;
}

const TIMEOUT = 5;
export function SoloGameView({
  songs,
  players,
  currentPlayerId,
  onGameComplete,
}: {
  songs: Song[];
  players: Player[];
  currentPlayerId: string;
  onGameComplete: (props: { id: string; score: number }) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT * 2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [songIdx, setSongIdx] = useState(0);
  const currentSong = songs[songIdx];

  useEffect(() => {
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
  }, [isPlaying, timeLeft]);

  const handleTimerEnd = () => {
    setIsPlaying(false);
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    setIsPlaying(false);

    // In a real implementation, this would check against the actual answer
    const isCorrect = item.key === currentSong?.id;
    if (isCorrect) {
      // Update player score
      const updatedPlayers = players.map((player) => {
        if (player.id === currentPlayerId) {
          return { ...player, score: player.score + timeLeft };
        }
        return player;
      });
    }
  };

  const handleNextTheme = async () => {
    if (songIdx >= songs.length - 1) {
      const player = players[0];
      if (player) {
        onGameComplete({
          id: player.id,
          score: player.score,
        });
      }
      return;
    }
    setSongIdx(songIdx + 1);
    setIsPlaying(true);
    setTimeLeft(TIMEOUT * 2);
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
              "absolute top-0 left-0 w-full h-full bg-black text-3xl grid place-items-center",
              isPlaying ? "opacity-100" : "hidden",
            )}
          >
            {timeLeft - TIMEOUT === 0 ? (
              <div>The answer is...</div>
            ) : (
              timeLeft - TIMEOUT
            )}
          </div>
          <iframe
            src={embedUrl(currentSong?.url)}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
            style={{ display: "block" }}
          ></iframe>
        </div>
      </div>
      <div className="h-[6rem]">
        <div className="mt-4 w-[90%] mx-auto">
          <SongAutocomplete
            ignoreThemes={[]}
            disabled={!isPlaying}
            onSelectedValueChange={handleGuess}
          />
        </div>
      </div>
    </div>
  );
}

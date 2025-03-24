import { useState, useEffect, startTransition } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SongAutocomplete } from "@/components/song-autocomplete";
import type { Player } from "./types";
import { actions } from "astro:actions";
import { useToast } from "@/hooks/use-toast";

type SongTheme = {
  id: string | null;
  url: string | null;
  nextPosition: number;
};

function embedUrl(_url?: string) {
  if (!_url) return "";
  const url = new URL(_url);
  const v = url.searchParams.get("v");
  return `https://www.youtube-nocookie.com/embed/${v}`;
}

const totalThemes = 5;
export function SoloGameView({
  gameId,
  quizTitle,
  players,
  currentPlayerId,
  onGameComplete,
}: {
  gameId: string;
  quizTitle: string;
  players: Player[];
  currentPlayerId: string;
  onGameComplete: () => void;
}) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTheme, setSongTheme] = useState<SongTheme>({
    id: null,
    url: null,
    nextPosition: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startTransition(async () => {
      setIsLoading(true);
      const nextTheme = await actions.games.getNextTheme({
        gameId,
        themePosition: songTheme.nextPosition,
      });
      if (nextTheme.error) {
        console.error(nextTheme.error);
        return;
      }
      setSongTheme({
        id: nextTheme.data.id,
        url: nextTheme.data.url[0] ?? null,
        nextPosition: nextTheme.data.nextPosition,
      });
      setIsPlaying(true);
      setTimeLeft(30);
      setIsLoading(false);
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTimerEnd = () => {
    setIsPlaying(false);
    toast({
      title: "Time's up!",
      description: "Better luck next time!",
      variant: "destructive",
    });
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    setIsPlaying(false);

    // In a real implementation, this would check against the actual answer
    const isCorrect = item.key === songTheme.id;
    const correctAnswer = {
      title: "Correct!",
      description: "You earned " + timeLeft + " points!",
      variant: "default" as const,
    };
    const wrongAnswer = {
      title: "Wrong!",
      description: "Better luck next time!",
      variant: "destructive" as const,
    };
    toast(isCorrect ? correctAnswer : wrongAnswer);

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
    if (songTheme.nextPosition >= totalThemes) {
      onGameComplete();
    } else {
      setIsLoading(true);
      const nextTheme = await actions.games.getNextTheme({
        gameId,
        themePosition: songTheme.nextPosition,
      });
      if (nextTheme.error) {
        console.error(nextTheme.error);
        return;
      }
      setSongTheme({
        id: nextTheme.data.id,
        url: nextTheme.data.url[0] ?? null,
        nextPosition: nextTheme.data.nextPosition,
      });
      setIsLoading(false);
      setIsPlaying(true);
      setTimeLeft(30);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{quizTitle}</CardTitle>
            <CardDescription>
              Theme {songTheme.nextPosition} of {totalThemes}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time Left</p>
            <p className="text-2xl font-bold">{timeLeft}s</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-md overflow-hidden">
          {isLoading || !songTheme.url ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              Loading theme...
            </div>
          ) : (
            <>
              <iframe
                src={embedUrl(songTheme.url)}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
                style={{ display: "block" }}
              ></iframe>
            </>
          )}
        </div>

        {isPlaying && (
          <div>
            <h3 className="font-medium mb-2">Guess the Anime:</h3>
            <SongAutocomplete
              ignoreThemes={[]}
              onSelectedValueChange={handleGuess}
            />
          </div>
        )}

        {/* Score & Next */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-xl font-bold">
                {players.find((p) => p.id === currentPlayerId)?.score || 0}
              </p>
            </div>
            {!isPlaying && (
              <Button onClick={handleNextTheme}>
                {songTheme.nextPosition >= totalThemes
                  ? "See Results"
                  : "Next Theme"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

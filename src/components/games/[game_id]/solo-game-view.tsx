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
import { PlayCircle } from "@phosphor-icons/react";
import type { Player } from "./types";
import { actions } from "astro:actions";

type Theme = {
  url: string[] | null;
  nextPosition: number;
};

function embedUrl(_url: string) {
  const url = new URL(_url);
  const v = url.searchParams.get("v");
  return `https://www.youtube-nocookie.com/embed/${v}`;
}
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
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessed, setGuessed] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<{
    id: string;
    correct: boolean;
  } | null>(null);
  const [theme, setTheme] = useState<Theme>({
    url: null,
    nextPosition: 0,
  });
  const [loading, setLoading] = useState(true);
  const totalThemes = 5;
  useEffect(() => {
    startTransition(async () => {
      setLoading(true);
      const nextTheme = await actions.games.getNextTheme({
        gameId,
        themePosition: theme.nextPosition,
      });
      if (nextTheme.error) {
        console.error(nextTheme.error);
        return;
      }
      console.log(nextTheme);
      setTheme(nextTheme.data);
      setLoading(false);
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isPlaying || guessed) return;

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
  }, [isPlaying, guessed]);

  const handleStartPlaying = () => {
    setIsPlaying(true);
    setTimeLeft(30);
  };

  const handleTimerEnd = () => {
    setGuessed(true);
    setIsPlaying(false);
    // Wrong answer by default when time runs out
    setCurrentAnswer({ id: "timeout", correct: false });
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    setGuessed(true);
    setIsPlaying(false);

    // In a real implementation, this would check against the actual answer
    const isCorrect = Math.random() > 0.5; // Simulate a check
    setCurrentAnswer({ id: item.key, correct: isCorrect });

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

  const handleNextTheme = () => {
    if (currentThemeIndex >= totalThemes - 1) {
      onGameComplete();
    } else {
      setCurrentThemeIndex((prev) => prev + 1);
      setIsPlaying(false);
      setGuessed(false);
      setCurrentAnswer(null);
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
              Theme {currentThemeIndex + 1} of {totalThemes}
              {theme.url?.[0]}
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
          {Array.isArray(theme.url) ? (
            <>
              <iframe
                src={embedUrl(theme.url[0])}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
                style={{ display: "block" }}
              ></iframe>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Loading theme...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {!isPlaying && !guessed && (
            <Button onClick={handleStartPlaying} disabled={loading}>
              <PlayCircle className="mr-2 w-5 h-5" />
              Play Theme
            </Button>
          )}
        </div>

        {/* Guess Input */}
        {isPlaying && !guessed && (
          <div>
            <h3 className="font-medium mb-2">Guess the Anime:</h3>
            <SongAutocomplete songs={[]} onSelectedValueChange={handleGuess} />
          </div>
        )}

        {/* Result */}
        {currentAnswer && (
          <div
            className={`p-4 rounded-md ${currentAnswer.correct ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
          >
            <h3 className="font-bold text-lg mb-1">
              {currentAnswer.correct ? "Correct!" : "Wrong!"}
            </h3>
            <p>
              {currentAnswer.correct
                ? `You earned ${timeLeft} points!`
                : "Better luck next time!"}
            </p>
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
            {guessed && (
              <Button onClick={handleNextTheme}>
                {currentThemeIndex >= totalThemes - 1
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

import { useEffect, useState } from "react";
import type { Player } from "./types";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SongAutocomplete } from "@/components/song-autocomplete";
import { PlayCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function MultiPlayerGameView({
  quizTitle,
  players,
  currentPlayerId,
  onGameComplete,
}: {
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
  const [themes, setThemes] = useState<Array<{ id: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const totalThemes = 5; // This would come from the API

  // Same fetch theme logic as SoloGameView
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(`/api/games/themes`);
        const data = await response.json();
        setThemes(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching themes:", error);
        setLoading(false);
      }
    };

    fetchThemes();
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
    setCurrentAnswer({ id: "timeout", correct: false });
  };

  const handleGuess = (item: { key: string; value: string; label: string }) => {
    setGuessed(true);
    setIsPlaying(false);

    // In a real implementation, this would check against the actual answer
    const isCorrect = Math.random() > 0.5; // Simulate a check
    setCurrentAnswer({ id: item.key, correct: isCorrect });

    if (isCorrect) {
      // Update player score - in a real implementation this would update via API
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
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time Left</p>
            <p className="text-2xl font-bold">{timeLeft}s</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-md border ${
                player.id === currentPlayerId
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium truncate">{player.name}</p>
                  <p className="text-sm">{player.score} pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-md overflow-hidden">
          {!loading &&
          themes.length > 0 &&
          currentThemeIndex < themes.length ? (
            <iframe
              src={themes[currentThemeIndex]?.url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
            <SongAutocomplete
              ignoreThemes={[]}
              onSelectedValueChange={handleGuess}
            />
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

        {/* Next */}
        {guessed && (
          <div className="flex justify-end">
            <Button onClick={handleNextTheme}>
              {currentThemeIndex >= totalThemes - 1
                ? "See Results"
                : "Next Theme"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

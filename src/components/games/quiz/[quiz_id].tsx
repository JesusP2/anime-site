import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, UsersThree, Calendar } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { navigate } from "astro:transitions/client";

type QuizInfo = {
  quizId: string;
  title: string | undefined;
  difficulty: string | undefined;
  public: boolean | undefined;
  createdAt: Date | null | undefined;
  themesLength: number;
};

export function CreateGame(props: QuizInfo) {
  const [isCreatingGame, setIsCreatingGame] = React.useState(false);

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    try {
      // Call API to create a game
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: props.quizId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create game");

      const { gameId } = await response.json();
      navigate(`/games/quiz/play/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsCreatingGame(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{props.title}</CardTitle>
              <CardDescription>
                {props.createdAt && (
                  <span className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    Created{" "}
                    {formatDistanceToNow(props.createdAt, { addSuffix: true })}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{props.difficulty}</Badge>
              {props.public ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  Public
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                >
                  Private
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Quiz Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>{props.themesLength} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <span>
                  {props.difficulty === "easy"
                    ? "Beginner friendly"
                    : props.difficulty === "medium"
                      ? "Anime fans"
                      : "For otakus only"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreateGame}
            disabled={isCreatingGame}
          >
            <UsersThree className="w-5 h-5 mr-2" />
            {isCreatingGame ? "Creating game..." : "Create Multiplayer Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

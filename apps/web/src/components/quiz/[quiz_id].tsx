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
import { Clock, UsersThree, Calendar } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { navigate } from "astro:transitions/client";
import { actions } from "astro:actions";
import { safeStartViewTransition } from "@/lib/safe-start-view-transition";

type QuizInfo = {
  quizId: string;
  title: string | undefined;
  difficulty: string | undefined;
  public: boolean | undefined;
  createdAt: Date | null | undefined;
  themesLength: number;
};

export function CreateGame(props: QuizInfo) {
  const handleCreateGame = async (gameType: "solo" | "multiplayer") => {
    const result = await actions.games.createGame({
      quizId: props.quizId,
      gameType,
    });
    if (result.error) {
      console.error(result.error);
      return;
    }
    const gameId = result.data;
    safeStartViewTransition(() => navigate(`/games/guess-the-anime-theme/room/${gameId}`));
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
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between space-x-6">
          <Button
            className="flex-1"
            size="lg"
            onClick={() => handleCreateGame("solo")}
          >
            <UsersThree className="w-5 h-5 mr-2" />
            Create Single Player Game
          </Button>
          <Button
            className="flex-1"
            size="lg"
            onClick={() => handleCreateGame("multiplayer")}
          >
            <UsersThree className="w-5 h-5 mr-2" />
            Create Multiplayer Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

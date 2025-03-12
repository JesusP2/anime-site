import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizLayout } from "./layout";
import {
  GameController,
  PlusCircle,
  Trophy,
  UsersThree,
  Shuffle,
} from "@phosphor-icons/react";

export function QuizHub() {
  return (
    <QuizLayout title="Guess the Anime Theme">
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Test your anime knowledge by guessing which scene this belongs to.
          Create your own quizzes or play against others!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-purple-200 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GameController className="w-5 h-5" />
                Play a Quiz
              </CardTitle>
              <CardDescription>
                Play an existing quiz or generate a random one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <Shuffle className="mr-2 w-5 h-5" />
                Random Quiz
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                <Trophy className="mr-2 w-5 h-5" />
                Browse Quizzes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Create a Quiz
              </CardTitle>
              <CardDescription>
                Create your own quiz to share with friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline" size="lg">
                <PlusCircle className="mr-2 w-5 h-5" />
                Create New Quiz
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">The Rules:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Listen to anime opening theme songs</li>
                <li>Choose the correct anime from multiple options</li>
                <li>Score points for correct answers and speed</li>
                <li>Quiz friends with your own curated song list</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-1">Game Modes:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Solo:</span> Test your own
                  knowledge at your pace
                </li>
                <li>
                  <span className="font-medium">Multiplayer:</span> Compete in
                  real-time with friends
                </li>
                <li>
                  <span className="font-medium">Custom Quizzes:</span> Create
                  and share your own collections
                </li>
                <li>
                  <span className="font-medium">Random:</span> Adjust difficulty
                  and get a surprise selection
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </QuizLayout>
  );
}

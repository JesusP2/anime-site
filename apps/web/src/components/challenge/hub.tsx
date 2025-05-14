import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GameController,
  PlusCircle,
  Trophy,
  Shuffle,
} from "@phosphor-icons/react";

export function ChallengeHub() {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Test your anime knowledge by guessing which scene this belongs to.
        Create your own challenges or play against others!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GameController className="w-5 h-5" />
              Play a Challenge
            </CardTitle>
            <CardDescription>
              Browse challenges 
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "w-full",
              })}
              href="/games/guess-the-anime-theme/my-challenges"
            >
              <Trophy className="mr-2 w-5 h-5" />
              My Challenges
            </a>
            <Button className="w-full" variant="outline" size="lg">
              <Trophy className="mr-2 w-5 h-5" />
              Browse Challenges
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create a Challenge
            </CardTitle>
            <CardDescription>
              Create your own challenge to share with friends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full",
              })}
              href="/games/guess-the-anime-theme/create"
            >
              <PlusCircle className="mr-2 w-5 h-5" />
              Create New Challenge
            </a>
            <Button className="w-full" size="lg">
              <Shuffle className="mr-2 w-5 h-5" />
              Random Challenge
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
              <li>Challenge friends with your own curated song list</li>
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
                <span className="font-medium">Custom Challenges:</span> Create and
                share your own collections
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
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, Copy, Crown } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type Player = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
};

type WaitingRoomProps = {
  gameId: string;
  quizTitle: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
};

export function WaitingRoom({
  gameId,
  quizTitle,
  players,
  isHost,
  onStartGame,
}: WaitingRoomProps) {
  const gameUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/games/quiz/join/${gameId}`
      : "";

  const copyGameLink = () => {
    navigator.clipboard.writeText(gameUrl);
    toast({
      title: "Link copied to clipboard",
      description: "Share this with your friends to join the game",
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Waiting Room</CardTitle>
          <CardDescription>Quiz: {quizTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input value={gameUrl} readOnly className="flex-1" />
              <Button variant="outline" onClick={copyGameLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with your friends to join this game
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Players ({players.length})</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>
                        {player.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  {player.isHost && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      Host
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isHost ? (
            <Button
              className="w-full"
              size="lg"
              onClick={onStartGame}
              disabled={players.length < 2}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          ) : (
            <p className="w-full text-center text-muted-foreground">
              Waiting for the host to start the game...
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

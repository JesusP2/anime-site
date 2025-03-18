import type { Player } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { GameType } from "@/lib/types";

export function WaitingRoom({
  quizTitle,
  players,
  isHost,
  gameType,
  onStartGame,
}: {
  quizTitle: string;
  players: Player[];
  isHost: boolean;
  gameType: GameType;
  onStartGame: () => void;
}) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{quizTitle}</CardTitle>
        {gameType === "multiplayer" && (
          <CardDescription>Waiting for players to join...</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium mb-4">Players ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{player.name}</p>
                  {player.isHost && <Badge variant="outline">Host</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isHost ? (
          <Button onClick={onStartGame} className="w-full">
            Start Game
          </Button>
        ) : (
          <p className="text-center w-full text-muted-foreground">
            Waiting for host to start the game...
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

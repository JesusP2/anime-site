import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersThree, Play, Plus, Crown } from "@phosphor-icons/react";
import type { GameState, Player } from "@repo/shared/types";

export type WaitingRoomProps = {
  quizTitle?: string | null;
  quizDescription?: string | null;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
} & (
  | {
      gameType: "solo";
    }
  | {
      gameType: "multiplayer";
      gameState: GameState | "ready";
      songIdx: number;
      isJoining: boolean;
      onUserReady: () => void;
      onResumeGame: () => void;
      hasGameStarted: boolean;
    }
);
export function WaitingRoom({
  quizTitle,
  quizDescription,
  players,
  isHost,
  onStartGame,
  ...extraProps
}: WaitingRoomProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="overflow-hidden relative shadow-lg">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-gray-100/20 to-gray-50/30 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-900/30 opacity-50"></div>

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
              <UsersThree
                weight="fill"
                className="text-gray-600 dark:text-gray-300 w-6 h-6"
              />
            </div>
            <CardTitle className="text-3xl font-bold">{quizTitle}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {quizDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Players ({players.length})
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                {extraProps.gameType === "multiplayer" ? "Multiplayer" : "Solo"}{" "}
                Game
              </span>
            </h2>

            {extraProps.gameType === "solo" && (
              <div className="grid gap-4 mb-6">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-xl">
                          {player.name}
                        </div>
                        {player.isHost && (
                          <div className="text-xs flex items-center text-amber-600 dark:text-amber-400">
                            <Crown weight="fill" className="w-3 h-3 mr-1" />
                            Host
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty slots for multiplayer games */}
            {extraProps.gameType === "multiplayer" && players.length < 4 && (
              <div className="grid gap-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-xl">
                          {player.name}
                        </div>
                        {player.isHost && (
                          <div className="text-xs flex items-center text-amber-600 dark:text-amber-400">
                            <Crown weight="fill" className="w-3 h-3 mr-1" />
                            Host
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {Array.from({ length: 4 - players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-dashed border-muted-foreground/30 flex items-center justify-center h-[76px]"
                  >
                    <div className="text-muted-foreground flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      <span>Waiting for player...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Actions
            {...{
              quizTitle,
              quizDescription,
              players,
              isHost,
              onStartGame,
              ...extraProps,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Actions(props: WaitingRoomProps) {
  if (props.gameType === "solo" || (props.isHost && !props.hasGameStarted)) {
    return (
      <div className="flex justify-center pt-4">
        <Button size="lg" className="w-40" onClick={props.onStartGame}>
          <Play weight="fill" className="w-5 h-5 mr-2" />
          Start Game
        </Button>
      </div>
    );
  } else if (props.isJoining) {
    return (
      <div className="flex justify-center pt-4">
        <Button size="lg" className="w-40" disabled>
          <Play weight="fill" className="w-5 h-5 mr-2" />
          Joining Game...
        </Button>
      </div>
    );
  } else if (
    props.hasGameStarted &&
    (props.isHost || (!props.isHost && props.gameState == "waiting"))
  ) {
    return (
      <div className="flex justify-center pt-4">
        <Button size="lg" className="w-40" onClick={props.onResumeGame}>
          Resume Game
        </Button>
      </div>
    );
  } else if (!props.isHost && props.gameState === "ready") {
    return (
      <div className="text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
        Waiting for the host to start the game...
      </div>
    );
  } else if (
    !props.isHost &&
    props.gameState === "waiting" &&
    !props.hasGameStarted
  ) {
    return (
      <div className="flex justify-center pt-4">
        <Button size="lg" className="w-40" onClick={props.onUserReady}>
          Ready
        </Button>
      </div>
    );
  }
}

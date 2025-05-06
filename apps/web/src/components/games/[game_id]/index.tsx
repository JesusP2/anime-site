import { SinglePlayer } from "./solo-game-view";
import { MultiPlayer } from "./multiplayer-game-view";
import type { GameManagerProps } from "@/lib/types";

export function GameManager(props: GameManagerProps & { gameType?: string }) {
  if (props.gameType === "solo") {
    return <SinglePlayer {...props} />;
  } else if (props.gameType === "multiplayer") {
    return <MultiPlayer {...props} />;
  }
}

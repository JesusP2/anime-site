import { SinglePlayer } from "./solo-game-view";
import type { GameManagerProps } from "@/lib/types";


export function GameManager(props: GameManagerProps & { gameType?: string }) {
  console.log(props);
  if (props.gameType === "solo") {
    return <SinglePlayer {...props} />;
  }
}

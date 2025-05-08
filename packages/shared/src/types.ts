export type Player = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  score: number;
};

export type GameState = "waiting" | "playing" | "results";

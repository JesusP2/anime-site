export type Player = {
  id: string;
  name: string;
  avatar?: string;
  score: number;
};

export type GameState = "waiting" | "playing" | "results";

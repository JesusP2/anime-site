import type { Game } from "./game";

export type Bindings = {
  GAME: DurableObjectNamespace<Game>;
};

import type { Game } from "./counter-do";

export type Bindings = {
  GAME: DurableObjectNamespace<Game>;
};

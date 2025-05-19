/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  // Note: 'import {} from ""' syntax does not work in .d.ts files.
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
    currentSeason: {
      year: number;
      season: string;
      ttl: number;
    };
  }
}

type Hyperdrive = import("@cloudflare/workers-types").Hyperdrive;
type AI = import("@cloudflare/workers-types").Ai;
type DurableObjectNamespace =
  import("@cloudflare/workers-types").DurableObjectNamespace;
interface Env {
  ANIME_API: "https://api.jikan.moe/v4";
  BETTER_AUTH_URL: "https://notmyanimelist.com";
  EMAIL_FROM: "noreply@notmyanimelist.com";
  GOOGLE_REDIRECT_URI: "https://notmyanimelist.com/api/auth/callback/google";
  BASE_URL: "https://notmyanimelist.com";
  HYPERDRIVE: Hyperdrive;
  AI: AI;
}

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

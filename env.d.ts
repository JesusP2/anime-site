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

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type HYPERDRIVE = import("@cloudflare/workers-types").HYPERDRIVE;
type ENV = {
  // replace `MY_KV` with your KV namespace
  HYPERDRIVE: HYPERDRIVE;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

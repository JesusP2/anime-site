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
type HYPERDRIVE = import("@cloudflare/workers-types").Hyperdrive;
type R2 = import("@cloudflare/workers-types").R2Bucket;
type ENV = {
  // replace `MY_KV` with your KV namespace
  HYPERDRIVE: HYPERDRIVE;
  R2: R2;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

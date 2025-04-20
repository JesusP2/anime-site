import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
import type { Transport } from "@axiomhq/logging";
import { Axiom } from "@axiomhq/js";
import { AXIOM_DATASET, AXIOM_TOKEN } from "astro:env/server";

const axiom = new Axiom({
  token: AXIOM_TOKEN,
});

// class CloudflareTransport implements Transport {
//   async log(logs: Parameters<Transport["log"]>[0]) {
//     const url = `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`;
//     await fetch(url, {
//       signal: AbortSignal.timeout(10_000),
//       method: "POST",
//       body: JSON.stringify(logs),
//       headers: {
//         "Content-Type": "application/x-ndjson",
//         Authorization: `Bearer ${AXIOM_TOKEN}`,
//         "User-Agent": "axiom-cloudflare/" + "0.3.0",
//       },
//     });
//     return;
//   }
//
//   flush() {
//     console.log("Flushing logs");
//   }
// }

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom,
      dataset: AXIOM_DATASET,
    }),
    new ConsoleTransport(),
  ],
});

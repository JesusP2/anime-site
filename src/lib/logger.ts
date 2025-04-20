// import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
// import type { Transport } from "@axiomhq/logging";
// import { Axiom } from "@axiomhq/js";
import { AXIOM_DATASET, AXIOM_TOKEN } from "astro:env/server";
//
// const axiom = new Axiom({
//   token: AXIOM_TOKEN,
// });

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

// export const logger = new Logger({
//   transports: [
//     new AxiomJSTransport({
//       axiom,
//       dataset: AXIOM_DATASET,
//     }),
//     new ConsoleTransport(),
//   ],
// });
class Logger {
  private dataset: string;
  private token: string;
  constructor(dataset: string, token: string) {
    this.dataset = dataset;
    this.token = token;
  }

  private stringifyWithErrorStack(obj: any, space: number) {
    const customReplacer = (key: string, value: any) => {
      return value;
    };

    return JSON.stringify(obj, customReplacer, 2);
  }

  private async log(level: string, log: any) {
    const url = `https://api.axiom.co/v1/datasets/${this.dataset}/ingest`;
    log.level = level;
    console.log(this.stringifyWithErrorStack(log, 2), JSON.stringify(log));
    await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      method: "POST",
      body: JSON.stringify(log, Object.getOwnPropertyNames(log)),
      headers: {
        "Content-Type": "application/x-ndjson",
        Authorization: `Bearer ${this.token}`,
        "User-Agent": "axiom-cloudflare/" + "0.3.0",
      },
    });
    return;
  }
  async info(message: string, log: any) {
    log.message = message;
    return this.log("INFO", log);
  }
  async error(message: string, log: any) {
    log.message = message;
    return this.log("ERROR", log);
  }
  async warn(message: string, log: any) {
    log.message = message;
    return this.log("WARN", log);
  }
}
export const logger = new Logger(AXIOM_DATASET, AXIOM_TOKEN);

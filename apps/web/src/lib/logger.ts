import { AXIOM_DATASET, AXIOM_TOKEN } from "astro:env/server";

class Logger {
  private dataset: string;
  private token: string;
  constructor(dataset: string, token: string) {
    this.dataset = dataset;
    this.token = token;
  }

  private async log(level: string, log: any) {
    const url = `https://api.axiom.co/v1/datasets/${this.dataset}/ingest`;
    log.level = level;
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
  async info(message: string, log: any = {}) {
    log.message = message;
    return this.log("INFO", log);
  }
  async error(message: string, log: any = {}) {
    log.message = message;
    return this.log("ERROR", log);
  }
  async warn(message: string, log: any = {}) {
    log.message = message;
    return this.log("WARN", log);
  }
}
export const logger = new Logger(AXIOM_DATASET, AXIOM_TOKEN);

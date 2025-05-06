import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";

export class Game extends DurableObject<Bindings> {
  value = 0;
  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env);
    // `blockConcurrencyWhile()` ensures no requests are delivered until initialization completes.
    this.ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      this.value = (await this.ctx.storage.get("value")) || 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    console.log(request.url);
    return new Response(JSON.stringify({ value: this.value }), {
      headers: { "content-type": "application/json" },
    });
  }

  async getCounterValue() {
    return this.value;
  }

  async increment(amount = 1): Promise<number> {
    this.value += amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }

  async decrement(amount = 1): Promise<number> {
    this.value -= amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }
}

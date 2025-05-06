import type {
  CfProperties,
  DurableObject,
  DurableObjectState,
  Request,
} from "@cloudflare/workers-types";
import { Response } from "@cloudflare/workers-types";

export class Counter implements DurableObject {
  value = 0;
  ctx: DurableObjectState;

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    // `blockConcurrencyWhile()` ensures no requests are delivered until initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      this.value = (await ctx.storage.get("value")) || 0;
    });
  }

  async fetch(
    request: Request<unknown, CfProperties<unknown>>,
  ): Promise<Response> {
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

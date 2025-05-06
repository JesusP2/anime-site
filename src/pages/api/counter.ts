import type { APIRoute } from "astro";

export const GET: APIRoute = async (ctx) => {
  const env = ctx.locals.runtime.env;
  const id = env.MY_COUNTER.idFromName("MY_COUNTER");
  const stub = env.MY_COUNTER.get(id);
  const response = stub.fetch(ctx.req);
  console.log(response);

  return new Response("Hello, World!");
};

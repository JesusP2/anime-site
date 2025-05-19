import { getAuth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";
import { ratelimit } from "./components/rate-limit";
import { getConnectionString } from "./lib/utils";
import { logger } from "./lib/logger";

export const onRequest = defineMiddleware(async (context, next) => {
  // context.locals.runtime.ctx.waitUntil(
  //   logger.info("running middleware", {
  //     path: context.request.url.toString(),
  //   }),
  // );
  // const res = await ratelimit.limit(context.clientAddress);
  // if (!res.success) {
  //   return new Response("Too many requests", {
  //     status: 429,
  //   });
  // }
  // NOTE: move this to the db
  let currentSeason = {
    year: 2025,
    season: "winter",
    ttl: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  if (currentSeason.ttl < Date.now()) {
    const res = await fetch("https://api.jikan.moe/v4/seasons/now?limit=1");
    const data = await res.json();
    currentSeason.year = data[0].year;
    currentSeason.season = data[0].season;
    currentSeason.ttl = Date.now() + 1000 * 60 * 60 * 24 * 7;
  }
  globalThis.connectionString = getConnectionString(context);
  globalThis.waitUntil = context.locals.runtime.ctx.waitUntil;
  globalThis.AI = context.locals.runtime.env.AI;
  const auth = getAuth(context);
  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (isAuthed) {
    context.locals.user = isAuthed.user;
    context.locals.session = isAuthed.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  context.locals.currentSeason = currentSeason;
  return next();
});

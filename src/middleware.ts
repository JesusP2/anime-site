import { getAuth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";
import { logger } from "./lib/logger";
import { ratelimit } from "./components/rate-limit";
import { AXIOM_TOKEN } from "astro:env/server";

export const onRequest = defineMiddleware(async (context, next) => {
  logger.info("request", {
    token: AXIOM_TOKEN,
  });
  const res = await ratelimit.limit(context.clientAddress);
  if (!res.success) {
    logger.info("ratelimit", res);
    return new Response("Too many requests", {
      status: 429,
    });
  }
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
  logger.info("method:", {
    method: context.request.method,
  });
  logger.info("ip:", {
    cloudflare: context.request.headers.get("cf-connecting-ip"),
    ip: context.clientAddress,
  });
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

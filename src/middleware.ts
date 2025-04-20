import { getAuth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";
import { logger } from "./lib/logger";
import { ratelimit } from "./components/rate-limit";
import { AXIOM_DATASET, AXIOM_TOKEN } from "astro:env/server";

async function sendLogs() {
  const url = `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`;
  return fetch(url, {
    signal: AbortSignal.timeout(30_000),
    method: "POST",
    body: JSON.stringify({
      message: "hello",
    }),
    headers: {
      "Content-Type": "application/x-ndjson",
      Authorization: `Bearer ${AXIOM_TOKEN}`,
      "User-Agent": "axiom-cloudflare/" + "0.3.0",
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  logger.info("request", {
    token: AXIOM_TOKEN,
    dataset: AXIOM_DATASET,
  });
  const res = await ratelimit.limit(context.clientAddress);
  if (!res.success) {
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
  globalThis.test = 'test';
  await sendLogs();
  context.locals.runtime.ctx.props;
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

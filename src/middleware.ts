import { getAuth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

let currentSeason = {
  year: 2025,
  season: "winter",
  ttl: Date.now() + 1000 * 60 * 60 * 24 * 7,
};
export const onRequest = defineMiddleware(async (context, next) => {
  if (currentSeason.ttl < Date.now()) {
    const res = await fetch("https://api.jikan.moe/v4/seasons/now?limit=1");
    const data = await res.json();
    currentSeason.year = data[0].year;
    currentSeason.season = data[0].season;
    currentSeason.ttl = Date.now() + 1000 * 60 * 60 * 24 * 7;
  }
  const auth = getAuth();
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

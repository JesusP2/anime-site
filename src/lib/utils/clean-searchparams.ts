import { objectKeys } from ".";
import type { AnimeFilters } from "../anime/filters";
import type { MangaFilters } from "../manga/filters";

export function cleanSearchParams<T extends AnimeFilters | MangaFilters>(
  searchParams: URLSearchParams,
  filters: T,
) {
  const keys = objectKeys(filters).filter((key) => key !== "sfw");
  const newSearchParams = new URLSearchParams();
  for (const key of keys) {
    if (typeof key !== "string") continue;
    // @ts-expect-error skill issue
    const allowedValues = filters[key].options.map(({ value }) => value);
    const values = searchParams.getAll(key);
    if (!values.length) continue;
    const filteredValues = values.filter((value) => {
      if (typeof allowedValues[0] === "string") {
        return allowedValues.includes(value);
      }
      if (typeof allowedValues[0] === "number") {
        return allowedValues.includes(Number(value));
      }
      if (typeof allowedValues[0] === "boolean") {
        return allowedValues.includes(value === "true");
      }
    });
    for (const value of filteredValues) {
      newSearchParams.append(key, value);
    }
  }
  const page = searchParams.get("page") as string;
  if (searchParams.get("page") && parseInt(page) > 0) {
    newSearchParams.set("page", page);
  }
  const season = searchParams.get("season") as string;
  if (
    searchParams.get("season") &&
    ["winter", "spring", "summer", "fall"].includes(season)
  ) {
    newSearchParams.set("season", season);
  }
  const year = searchParams.get("year") as string;
  if (searchParams.get("year") && parseInt(year) > 0) {
    newSearchParams.set("year", year);
  }
  let ratings = newSearchParams.getAll("rating");
  if (searchParams.get("sfw") === "false" && ratings.length) {
    ratings = ratings.filter((rating) => !rating.startsWith("R"));
  } else if (searchParams.get("sfw") === "false") {
    ratings = filters.rating.options
      .map(({ value }) => value)
      .filter((rating) => !rating.startsWith("R"));
  }
  if (ratings.length) {
    newSearchParams.delete("rating");
    for (const rating of ratings) {
      newSearchParams.append("rating", rating);
    }
  } else {
    newSearchParams.delete("rating");
  }
  return newSearchParams;
}

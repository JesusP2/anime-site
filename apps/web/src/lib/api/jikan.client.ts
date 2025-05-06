import type { paths } from "./jikan.openapi";
import createClient from "openapi-fetch";

export const jikanClient = createClient<paths>({
  baseUrl: "https://api.jikan.moe/v4",
});

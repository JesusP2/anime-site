// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  prefetch: {
    defaultStrategy: "viewport",
  },
  // experimental: {
  //   clientPrerender: true,
  // },
  env: {
    validateSecrets: true,
    schema: {
      ANIME_API: envField.string({ context: "client", access: "public" }),
      WS_URL: envField.string({ context: "client", access: "public" }),
      CLOUDFLARE_TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      CLOUDFLARE_TOKEN: envField.string({
        context: "server",
        access: "public",
      }),
      R2_ENDPOINT: envField.string({ context: "server", access: "public" }),
      R2_ACCESS_KEY_ID: envField.string({
        context: "server",
        access: "public",
      }),
      R2_SECRET_ACCESS_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      R2_BUCKET: envField.string({ context: "server", access: "public" }),
      GOOGLE_CLIENT_ID: envField.string({
        context: "server",
        access: "public",
      }),
      GOOGLE_CLIENT_SECRET: envField.string({
        context: "server",
        access: "public",
      }),
      GOOGLE_REDIRECT_URI: envField.string({
        context: "server",
        access: "public",
      }),
      OPENAI_API_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      BETTER_AUTH_SECRET: envField.string({
        context: "server",
        access: "public",
      }),
      BETTER_AUTH_URL: envField.string({
        context: "server",
        access: "public",
      }),
      REDIS_URL: envField.string({ context: "server", access: "public" }),
      REDIS_TOKEN: envField.string({ context: "server", access: "public" }),
      RESEND_API_KEY: envField.string({ context: "server", access: "public" }),
      EMAIL_FROM: envField.string({ context: "server", access: "public" }),
      BASE_URL: envField.string({ context: "client", access: "public" }),
      AXIOM_DATASET: envField.string({ context: "server", access: "public" }),
      AXIOM_TOKEN: envField.string({ context: "server", access: "secret" }),
    },
  },
  integrations: [react()],
  image: {
    domains: ["cdn.myanimelist.net"],
  },
  adapter: cloudflare(),
  // server: {
  //   host: "0.0.0.0",
  //   port: 4321,
  // },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    optimizeDeps: {
      exclude: ["@electric-sql/pglite"],
    },
  },
});

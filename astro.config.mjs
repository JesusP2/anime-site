// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";
import path from "path";

import node from "@astrojs/node";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  env: {
    schema: {
      ANIME_API: envField.string({ context: "client", access: "public" }),
      CLOUDFLARE_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
      R2_ENDPOINT: envField.string({ context: "server", access: "public" }),
      R2_ACCESS_KEY_ID: envField.string({
        context: "server",
        access: "public",
      }),
      R2_SECRET_ACCESS_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      R2_BUCKET: envField.string({ context: "server", access: "public" }),
      GOOGLE_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_REDIRECT_URI: envField.string({
        context: "server",
        access: "public",
      }),
      OPENAI_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      BETTER_AUTH_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      BETTER_AUTH_URL: envField.string({
        context: "server",
        access: "public",
      }),
      POSTGRES_URL: envField.string({ context: "server", access: "secret" }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
      EMAIL_FROM: envField.string({ context: "server", access: "public" }),
      BASE_URL: envField.string({ context: "client", access: "public" }),
    },
  },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  image: {
    domains: ["cdn.myanimelist.net"],
  },
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: import.meta.env.PROD && ['postgres'],
    },
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
        postgres: path.resolve(import.meta.dirname, "node_modules/postgres/src/index.js"),
      },
    },
    optimizeDeps: {
      exclude: ["@electric-sql/pglite"],
    },
  },
});

// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  env: {
    schema: {
      ANIME_API:envField.string({ context: "client", access: "public" }),
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      DATABASE_TOKEN: envField.string({ context: "server", access: "secret" }),
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
      // RESEND_API_KEY: envField.string({ context: "server", access: "public" }),
      // EMAIL_FROM: envField.string({ context: "server", access: "public" }),
    },
  },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
});

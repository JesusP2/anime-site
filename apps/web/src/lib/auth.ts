import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/pool";
import { magicLink, emailOTP, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import {
  BETTER_AUTH_SECRET,
  EMAIL_FROM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "astro:env/server";
import { resend, sendEmail } from "./email";
import { BASE_URL } from "astro:env/client";
import type { APIContext } from "astro";
import type { ActionAPIContext } from "astro:actions";
import { redis } from "./db/redis";
import { magicLinkTemplate } from "./email/templates/magic-link";
import { forgotPasswordTemplate } from "./email/templates/otp";

export function getAuth(context: APIContext | ActionAPIContext) {
  const db = getDb();
  const auth = betterAuth({
    rateLimit: {
      enabled: true,
      window: 10,
      max: 100,
      customRules: {
        "/": {
          window: 60,
          max: 10,
        },
      },
      storage: "secondary-storage",
      modelName: "rateLimit",
    },
    secondaryStorage: {
      get: async (key) => {
        const value = await redis.get(key);
        return value ? JSON.stringify(value) : null;
      },
      set: async (key, value, ttl) => {
        if (ttl) await redis.set(key, value, { ex: ttl });
        else await redis.set(key, value);
      },
      delete: async (key) => {
        await redis.del(key);
      },
    },
    plugins: [
      // captcha({
      //   provider: "cloudflare-turnstile",
      //   secretKey: CLOUDFLARE_TURNSTILE_SECRET_KEY,
      // }),
      username(),
      passkey(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: "Magic link",
            react: magicLinkTemplate(url),
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          // TODO: implement emailOTP
          console.log('sendVerificationOTP');
          // const template = forgotPasswordTemplate(otp);
          // await sendEmail(email, "Reset password", template);
        },
      }),
    ],
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, token }) => {
        const url = BASE_URL + "/auth/reset-password/" + token;
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Reset password",
          react: forgotPasswordTemplate(url),
        });
      },
    },
    baseURL: BASE_URL,
    secret: BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        enabled: true,
        redirectURI: GOOGLE_REDIRECT_URI,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        // clientId: process.env.GOOGLE_CLIENT_ID!,
        // clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  });
  return auth;
}

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/pool";
import { magicLink, emailOTP, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import {
  BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "astro:env/server";
import { sendEmail } from "./email";
import { magicLinkTemplate } from "./email/templates/magic-link";
import { forgotPasswordTemplate } from "./email/templates/otp";
import { BASE_URL } from "astro:env/client";

export function getAuth() {
  const db = getDb();
  const auth = betterAuth({
    plugins: [
      username(),
      passkey(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const template = magicLinkTemplate(url);
          await sendEmail(email, "Magic link", template);
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          const template = forgotPasswordTemplate(otp);
          await sendEmail(email, "Reset password", template);
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
        await sendEmail(
          user.email,
          "Reset password",
          forgotPasswordTemplate(url),
        );
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

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/pool";
import { magicLink, emailOTP, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "astro:env/server";
export const auth = betterAuth({
  plugins: [
    username(),
    passkey(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        console.log("sending magic link", email, token, url);
        // send email to user
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("send verification otp:", email, otp, type);
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
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
auth.api.changePassword

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/pool";
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "astro:env/server";
import { magicLink, emailOTP, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
magicLink;
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
      // clientId: GOOGLE_CLIENT_ID,
      // clientSecret: GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

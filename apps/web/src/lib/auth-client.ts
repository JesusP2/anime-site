import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  magicLinkClient,
  passkeyClient,
  usernameClient,
} from "better-auth/client/plugins";
import { BASE_URL } from "astro:env/client";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    usernameClient(),
  ],
});

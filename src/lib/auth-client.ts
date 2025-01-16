import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  magicLinkClient,
  passkeyClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), emailOTPClient(), passkeyClient(), usernameClient()],
});

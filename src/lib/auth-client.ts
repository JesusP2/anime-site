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
// const data = await authClient.signUp.email({
//     name: "Test User",
//     password: "password1234",
//     username: "test"
// })

import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const auth = {
  signUp: defineAction({
    accept: "form",
    input: z.object({
      username: z.string().email(),
      password: z.string(),
    }),
    handler: async ({ username, password }) => {
      console.log('signup action:', username, password);
      return {
        username,
        password,
      };
    },
  }),
};

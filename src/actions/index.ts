import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  signUp: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    handler: async ({ email, password }) => {
      console.log(email, password);
    },
  }),
};

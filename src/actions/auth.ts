import { defineAction, ActionError, ACTION_ERROR_CODES } from "astro:actions";
import { z } from "astro:schema";
import { auth as betterAuth } from "@/lib/auth";
import { APIError } from "better-auth/api";

export const auth = {
  signUp: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
    }),
    handler: async ({ email, password }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Already logged in",
        });
      }
      try {
        await betterAuth.api.signUpEmail({
          body: {
            email,
            name: email.split("@").at(0)!,
            password,
          },
        });
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find(code => code === err.status);
          throw new ActionError({
            code: code ?? "BAD_REQUEST",
            message: err.body.message,
          });
        }
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Something went wrong, please try again",
        });
      }
    },
  }),
  signIn: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
    }),
    handler: async ({ email, password }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Already logged in",
        });
      }
      try {
        await betterAuth.api.signInEmail({
          body: {
            email,
            password,
          },
        });
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find(code => code === err.status);
          throw new ActionError({
            code: code ?? "BAD_REQUEST",
            message: err.body.message,
          });
        }
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Something went wrong, please try again",
        });
      }
    },
  }),
};

import { defineAction, ActionError, ACTION_ERROR_CODES } from "astro:actions";
import { z } from "astro:schema";
import { auth as betterAuth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { parseCookies } from "better-auth";

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
          const code = ACTION_ERROR_CODES.find((code) => code === err.status);
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
        const yo = await betterAuth.api.signInEmail({
          body: {
            email,
            password,
          },
          asResponse: true,
        });
        console.log(parseCookies(yo.headers.get("set-cookie")));
        const cookie = parseCookies(yo.headers.get("set-cookie"));
        const [key, value] = [...cookie.entries()][0];
        console.log(key, value);
        context.cookies.set(key, value, {
          httpOnly: true,
          maxAge: cookie.get("Max-Age"),
          path: cookie.get("Path"),
          sameSite: cookie.get("SameSite"),
        });
        // const cookie = parseCookies(yo);
        // console.log(cookie);
        // context.cookies.set
        // setCookie(context.request.headers)
        // setSessionCookie
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find((code) => code === err.status);
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
  magicLink: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Already logged in",
        });
      }
      try {
        await betterAuth.api.signInMagicLink({
          body: {
            email,
          },
          headers: new Headers({
            Location: "/",
          }),
        });
        return { email };
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find((code) => code === err.status);
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
  forgotPassword: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Already logged in",
        });
      }
      try {
        await betterAuth.api.forgetPassword({
          body: {
            email,
            redirectTo: "/",
          },
        });
        return { email };
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find((code) => code === err.status);
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
  resetPassword: defineAction({
    accept: "form",
    input: z.object({
      password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
      confirmPassword: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
      token: z.string(),
    }),
    handler: async ({ password, confirmPassword, token }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Already logged in",
        });
      }
      if (password !== confirmPassword) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Passwords do not match",
        });
      }
      try {
        await betterAuth.api.resetPassword({
          body: {
            newPassword: password,
            token,
          },
        });
      } catch (err) {
        if (err instanceof APIError) {
          const code = ACTION_ERROR_CODES.find((code) => code === err.status);
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

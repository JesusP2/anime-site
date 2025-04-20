import { CLOUDFLARE_TURNSTILE_SECRET_KEY } from "astro:env/server";
import { err, ok, type Result } from "./result";
import { ActionError } from "astro:actions";
import { logger } from "./logger";

export async function validateTurnstileToken(
  request: Request,
): Promise<Result<FormData, ActionError>> {
  const contentType = request.headers.get("Content-Type");
  let token = "";
  const ip = request.headers.get("CF-Connecting-IP") as string;
  try {
    if (contentType === "application/json") {
      const body = await request.json();
      token = body.token;
    } else {
      const formData = await request.formData();
      token = formData.get("cf-turnstile-response") as string;
    }
    let formData = new FormData();
    formData.append("secret", CLOUDFLARE_TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", ip);
    const idempotencyKey = crypto.randomUUID();
    formData.append("idempotency_key", idempotencyKey);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: formData,
        method: "POST",
      },
    );
    if (!res.ok) {
      logger.error("error fetching turnstile", {
        message: await res.text().catch(() => "Could not fetch turnstile"),
        statusText: res.statusText,
      });
      return err(
        new ActionError({
          code: "BAD_REQUEST",
          message: "Bad request",
        }),
      );
    }
    const data = await res.json();
    if (data.success) {
      return ok(formData);
    }
    return err(
      new ActionError({
        code: "BAD_REQUEST",
        message: data.error,
      }),
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error("error fetching turnstile", error);
    }
    return err(
      new ActionError({
        code: "BAD_REQUEST",
        message: "Bad request",
      }),
    );
  }
}

import { RESEND_API_KEY, EMAIL_FROM } from "astro:env/server";
import { Resend } from "resend"

export async function sendEmail(email: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject,
      html,
    }),
  });

  if (res.ok) {
    const data = await res.json();
  }
}
export const resend = new Resend(RESEND_API_KEY);

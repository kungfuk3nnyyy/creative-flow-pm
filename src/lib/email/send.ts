import { getResend, getFromEmail } from "./resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend.
 * Respects DISABLE_EMAIL env flag for local development.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (process.env.DISABLE_EMAIL === "true") {
    console.warn(
      `[email] Skipped (DISABLE_EMAIL=true): to=${options.to} subject="${options.subject}"`,
    );
    return true;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[email] Skipped (no RESEND_API_KEY): to=${options.to} subject="${options.subject}"`,
    );
    return false;
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: getFromEmail(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return false;
  }
}

import nodemailer from "nodemailer";

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  };
}

export function mailIsConfigured() {
  return Boolean(smtpConfig());
}

export async function sendCommercialEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const config = smtpConfig();
  if (!config) throw new Error("SMTP_NOT_CONFIGURED");

  const transporter = nodemailer.createTransport(config);
  return transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

import "server-only";
import { db } from "@/lib/db";

// Notificaciones: se guardan en BD (para la campana en web/app) y se envían por email.
// El driver de email es intercambiable (Resend, SES, Postmark…); en dev se imprime en consola.
export interface EmailDriver {
  send(to: string, subject: string, text: string): Promise<void>;
}

const consoleDriver: EmailDriver = {
  async send(to, subject, text) {
    console.info(`[email] → ${to}: ${subject}\n${text}`);
  },
};

export const emailDriver: EmailDriver = consoleDriver;

export async function notify(userId: string, type: string, payload: Record<string, unknown> = {}) {
  await db.notification.create({ data: { userId, type, payload: JSON.stringify(payload) } });
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user) await emailDriver.send(user.email, `[LocalLingo] ${type}`, JSON.stringify(payload, null, 2));
}

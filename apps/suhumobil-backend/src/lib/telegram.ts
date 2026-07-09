import { env } from "../config/env";
import { logger } from "./logger";

/**
 * Fire-and-forget Telegram notification. Failures are logged but never
 * thrown back to the caller (lead creation must not fail because of this).
 */
export async function sendTelegramNotification(text: string): Promise<void> {
  if (!env.telegramBotToken || !env.telegramChatId) {
    logger.warn("Telegram bot token/chat id not configured, skipping notification");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.telegramChatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Telegram notification failed");
    }
  } catch (err) {
    logger.error({ err }, "Telegram notification error");
  }
}

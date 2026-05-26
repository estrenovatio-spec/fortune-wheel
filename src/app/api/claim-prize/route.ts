import { NextResponse } from "next/server";
import { z } from "zod";
import { appendWheelClaimToGoogleSheet } from "@/lib/google-sheets";

const bodySchema = z.object({
  prizeId: z.string().min(1).max(64),
  prizeTitle: z.string().min(1).max(200),
  fullName: z.string().min(1).max(120),
  phone: z.string().min(5).max(32),
  telegram: z.string().max(64).optional(),
});

const TELEGRAM_API = "https://api.telegram.org/bot";

async function notifyTelegram(
  prizeTitle: string,
  fullName: string,
  phone: string,
  telegram?: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.warn(
      "Telegram: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID на Vercel (проект fortune-wheel)",
    );
    return;
  }

  const lines = [
    "🎡 <b>Колесо фортуны — новый приз</b>",
    "",
    `<b>Приз:</b> ${escapeHtml(prizeTitle)}`,
    `<b>Имя:</b> ${escapeHtml(fullName)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
  ];
  if (telegram) lines.push(`<b>Telegram:</b> ${escapeHtml(telegram)}`);

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) lines.push("", `<b>Сайт:</b> ${escapeHtml(site)}`);

  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Telegram sendMessage failed (${res.status}): ${body.slice(0, 300)}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    await notifyTelegram(data.prizeTitle, data.fullName, data.phone, data.telegram);

    try {
      await appendWheelClaimToGoogleSheet({
        fullName: data.fullName,
        phone: data.phone,
        telegram: data.telegram,
        prizeId: data.prizeId,
        prizeTitle: data.prizeTitle,
      });
    } catch (err) {
      console.error("Google Sheets sync failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

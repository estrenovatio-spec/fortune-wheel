import { NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org/bot";

type TgMessage = {
  message_id: number;
  chat: { id: number };
  text?: string;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
};

function isAppssVerifyCommand(text: string): boolean {
  const first = text.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return (
    first === "/appss_verify" ||
    first === "appss_verify" ||
    first.startsWith("/appss_verify@")
  );
}

async function sendTelegramReply(chatId: number, text: string, token: string): Promise<boolean> {
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("telegram webhook sendMessage:", res.status, body.slice(0, 300));
    return false;
  }
  return true;
}

/** Webhook Telegram — ответ на /appss_verify для публикации Mini App */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      console.error("telegram webhook: forbidden — проверьте TELEGRAM_WEBHOOK_SECRET или удалите переменную");
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const text = message?.text?.trim();
  if (!message?.chat?.id || !text) {
    return NextResponse.json({ ok: true });
  }

  if (!isAppssVerifyCommand(text)) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("telegram webhook: TELEGRAM_BOT_TOKEN не задан на Vercel");
    return NextResponse.json({ ok: true, warning: "no token" });
  }

  const code = process.env.TELEGRAM_APPSS_VERIFY_CODE?.trim() || "appss_b1506c";
  console.log("telegram webhook: /appss_verify from chat", message.chat.id);
  await sendTelegramReply(message.chat.id, code, token);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const hasSecret = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim());
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://fortune-wheel-snowy.vercel.app";
  const cleanSite = site.replace(/\/$/, "");
  return NextResponse.json({
    ok: true,
    webhookUrl: `${cleanSite}/api/telegram/webhook`,
    hasToken,
    hasWebhookSecret: hasSecret,
    hint: hasSecret
      ? "TELEGRAM_WEBHOOK_SECRET задан — setWebhook должен передавать secret_token"
      : "Вызовите /api/telegram/setup-webhook с CRON_SECRET",
  });
}

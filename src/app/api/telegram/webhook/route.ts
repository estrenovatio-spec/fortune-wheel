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

async function sendTelegramReply(chatId: number, text: string, token: string): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("telegram webhook sendMessage:", res.status, body.slice(0, 200));
  }
}

/** Webhook Telegram — ответ на /appss_verify для публикации Mini App */
export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: "missing TELEGRAM_BOT_TOKEN" }, { status: 500 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const message = update.message;
  const text = message?.text?.trim();
  if (!message || !text) {
    return NextResponse.json({ ok: true });
  }

  const command = text.split(/\s/)[0]?.toLowerCase();
  if (command === "/appss_verify" || command.startsWith("/appss_verify@")) {
    const code =
      process.env.TELEGRAM_APPSS_VERIFY_CODE?.trim() || "appss_b1506c";
    await sendTelegramReply(message.chat.id, code, token);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST webhook for Telegram Bot API",
  });
}

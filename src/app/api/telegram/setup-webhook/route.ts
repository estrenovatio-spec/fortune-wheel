import { NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org/bot";

/** Подключить webhook к этому деплою (один curl вместо ручного setWebhook) */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: "missing TELEGRAM_BOT_TOKEN on Vercel" }, { status: 500 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fortune-wheel-snowy.vercel.app";
  const webhookUrl = `${site.replace(/\/$/, "")}/api/telegram/webhook`;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  const body: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  };
  if (webhookSecret) body.secret_token = webhookSecret;

  const setRes = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const setJson = await setRes.json();

  const infoRes = await fetch(`${TELEGRAM_API}${token}/getWebhookInfo`);
  const infoJson = await infoRes.json();

  return NextResponse.json({
    webhookUrl,
    setWebhook: setJson,
    webhookInfo: infoJson,
    nextStep: "Отправьте боту /appss_verify — должен ответить кодом из TELEGRAM_APPSS_VERIFY_CODE",
  });
}

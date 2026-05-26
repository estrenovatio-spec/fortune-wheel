import { NextResponse } from "next/server";
import { currentSpinPeriod } from "@/lib/wheel-period";

const TELEGRAM_API = "https://api.telegram.org/bot";

type ReminderPayload = {
  ok?: boolean;
  userIds?: number[];
  error?: string;
};

async function fetchReminderUserIds(webhookUrl: string): Promise<number[]> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "wheel_export_reminders" }),
    redirect: "manual",
  });

  let finalRes = res;
  if (res.status === 301 || res.status === 302 || res.status === 307) {
    const location = res.headers.get("location");
    if (location) {
      finalRes = await fetch(location, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "wheel_export_reminders" }),
        redirect: "follow",
      });
    }
  }

  const text = await finalRes.text();
  if (!finalRes.ok) throw new Error(`reminders export ${finalRes.status}: ${text.slice(0, 200)}`);

  const data = JSON.parse(text) as ReminderPayload;
  if (!data.ok || !Array.isArray(data.userIds)) {
    throw new Error(data.error ?? "invalid reminders response");
  }

  return data.userIds.filter((id) => Number.isFinite(id) && id > 0);
}

async function sendReminder(
  chatId: number,
  token: string,
  siteUrl: string,
  isTest = false,
): Promise<boolean> {
  const period = currentSpinPeriod();
  const text = [
    isTest ? "🧪 <b>ТЕСТ — так придёт напоминание 1-го числа</b>\n" : "",
    "🎡 <b>Колесо фортуны — новый месяц!</b>",
    "",
    "С 1-го числа снова доступен один спин с подарком.",
    "Откройте бота и нажмите «Колесо фортуны».",
    "",
    `<a href="${siteUrl}">Крутить колесо</a>`,
    "",
    `<i>Период: ${period}</i>`,
  ].join("\n");

  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });
  return res.ok;
}

/** 1-го числа каждого месяца (Vercel Cron) — напоминание в Telegram */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fortune-wheel-snowy.vercel.app";
  const testAdmin = new URL(req.url).searchParams.get("test") === "admin";

  if (!token) {
    return NextResponse.json({ error: "missing TELEGRAM_BOT_TOKEN" }, { status: 500 });
  }

  if (testAdmin) {
    const adminRaw = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    const adminId = adminRaw ? Number(adminRaw) : NaN;
    if (!Number.isFinite(adminId)) {
      return NextResponse.json({ error: "missing TELEGRAM_ADMIN_CHAT_ID" }, { status: 500 });
    }
    const ok = await sendReminder(adminId, token, siteUrl, true);
    return NextResponse.json({
      ok,
      mode: "test_admin",
      chatId: adminId,
      message: ok
        ? "Тестовое сообщение отправлено в ваш Telegram"
        : "Не удалось отправить — проверьте токен и chat id, нажмите Start у бота",
    });
  }

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "missing GOOGLE_SHEETS_WEBHOOK_URL" },
      { status: 500 },
    );
  }

  try {
    const userIds = await fetchReminderUserIds(webhookUrl);
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const ok = await sendReminder(userId, token, siteUrl);
      if (ok) sent += 1;
      else failed += 1;
      await new Promise((r) => setTimeout(r, 50));
    }

    return NextResponse.json({
      ok: true,
      period: currentSpinPeriod(),
      total: userIds.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("monthly-wheel-reminder:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

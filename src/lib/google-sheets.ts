import { WHEEL_PRIZES } from "@/lib/wheel-prizes";

export type WheelClaimRow = {
  fullName: string;
  phone: string;
  telegram?: string;
  telegramUserId?: number;
  spinPeriod?: string;
  prizeId: string;
  prizeTitle: string;
};

/** POST в Apps Script (учитывает 302, иначе doPost не получает тело) */
async function postToAppsScript(webhookUrl: string, body: Record<string, unknown>): Promise<void> {
  const payload = JSON.stringify(body);
  const headers = { "Content-Type": "application/json" };

  let res = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: payload,
    redirect: "manual",
  });

  if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307) {
    const location = res.headers.get("location");
    if (location) {
      res = await fetch(location, {
        method: "POST",
        headers,
        body: payload,
        redirect: "follow",
      });
    }
  }

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Google Sheets webhook HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  try {
    const parsed = JSON.parse(text) as { ok?: boolean; error?: string };
    if (parsed.ok === false) {
      throw new Error(parsed.error ?? "Apps Script returned ok: false");
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      if (!text.includes('"ok":true') && !text.includes('"ok": true')) {
        throw new Error(`Google Sheets unexpected response: ${text.slice(0, 200)}`);
      }
    } else {
      throw e;
    }
  }
}

/** Отправка заявки с колеса в Google Таблицу (Apps Script, см. docs/GOOGLE-SHEETS.md) */
export async function appendWheelClaimToGoogleSheet(claim: WheelClaimRow): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn(
      "Google Sheets: GOOGLE_SHEETS_WEBHOOK_URL не задан — строка в таблицу не отправляется",
    );
    return;
  }

  const prize = WHEEL_PRIZES.find((p) => p.id === claim.prizeId);
  const prizeDescription = prize?.description ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  await postToAppsScript(webhookUrl, {
    type: "wheel",
    createdAt: new Date().toISOString(),
    fullName: claim.fullName,
    phone: claim.phone,
    telegram: claim.telegram ?? "",
    telegramUserId: claim.telegramUserId ?? "",
    spinPeriod: claim.spinPeriod ?? "",
    prizeId: claim.prizeId,
    prizeTitle: claim.prizeTitle,
    prizeDescription,
    prizeLabel: prize?.label ?? "",
    promoCode: prize?.promoCode ?? "",
    prizeType: prize?.type ?? "",
    siteUrl,
  });

  if (claim.telegramUserId) {
    await postToAppsScript(webhookUrl, {
      type: "wheel_register_reminder",
      telegramUserId: claim.telegramUserId,
      telegram: claim.telegram ?? "",
      spinPeriod: claim.spinPeriod ?? "",
    });
  }
}

import { WHEEL_PRIZES } from "@/lib/wheel-prizes";

export type WheelClaimRow = {
  fullName: string;
  phone: string;
  telegram?: string;
  prizeId: string;
  prizeTitle: string;
};

/** Отправка заявки с колеса в Google Таблицу (Apps Script, см. docs/GOOGLE-SHEETS.md) */
export async function appendWheelClaimToGoogleSheet(claim: WheelClaimRow): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const prize = WHEEL_PRIZES.find((p) => p.id === claim.prizeId);
  const prizeDescription = prize?.description ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  const row = {
    type: "wheel",
    createdAt: new Date().toISOString(),
    fullName: claim.fullName,
    phone: claim.phone,
    telegram: claim.telegram ?? "",
    prizeId: claim.prizeId,
    prizeTitle: claim.prizeTitle,
    prizeDescription,
    prizeLabel: prize?.label ?? "",
    promoCode: prize?.promoCode ?? "",
    prizeType: prize?.type ?? "",
    siteUrl,
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
    redirect: "follow",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets webhook ${res.status}: ${text.slice(0, 200)}`);
  }
}

import type { WheelPrize } from "@/lib/wheel-prizes";

export type ClaimAction = {
  label: string;
  href: string;
};

const BOOKING_DEFAULT = "https://calendar.app.google/K75gRupshpSXMmLTA";
const CLUB_DEFAULT = "https://t.me/+Wp8JXEa6wUVlMWZi";

function hrefFromEnvOrPrize(
  envValue: string | undefined,
  prize: WheelPrize,
): string | null {
  const fromEnv = envValue?.trim();
  if (fromEnv) return fromEnv;
  const fromPrize = prize.claimHref?.trim();
  return fromPrize || null;
}

/** Ссылки на облако / запись — показываются сразу после отправки контактов */
export function getClaimActions(prize: WheelPrize): ClaimAction[] {
  const actions: ClaimAction[] = [];

  if (prize.id === "checklist") {
    const url = hrefFromEnvOrPrize(
      process.env.NEXT_PUBLIC_RESOURCE_CHECKLIST_URL,
      prize,
    );
    if (url) {
      actions.push({ label: "📋 Скачать чек-лист «5 вопросов»", href: url });
    }
  }

  if (prize.id === "roadmap") {
    const url = hrefFromEnvOrPrize(process.env.NEXT_PUBLIC_RESOURCE_ROADMAP_URL, prize);
    if (url) {
      actions.push({ label: "🧩 Открыть конструктор целей", href: url });
    }
  }

  if (prize.id === "diagnostics") {
    const url =
      process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || BOOKING_DEFAULT;
    actions.push({
      label: "📅 Записаться на диагностику",
      href: url,
    });
  }

  if (prize.id === "club") {
    const url = process.env.NEXT_PUBLIC_CLUB_TELEGRAM_URL?.trim() || CLUB_DEFAULT;
    actions.push({
      label: "♣️ Вступить в Клуб капитала (7 дней)",
      href: url,
    });
  }

  if (prize.telegramDmUrl) {
    actions.push({
      label: "💬 Напишите мне в личку СРАЗУ",
      href: prize.telegramDmUrl,
    });
  }

  if (prize.id === "retry") {
    const url = hrefFromEnvOrPrize(process.env.NEXT_PUBLIC_RESOURCE_BOOK_URL, prize);
    if (url) {
      actions.push({
        label: "📚 Книга «Самый богатый человек в Вавилоне» (скачать)",
        href: url,
      });
    }
  }

  return actions;
}

export function getClaimFootnote(prize: WheelPrize): string | null {
  if (getClaimActions(prize).length > 0) return null;
  if (prize.promoCode) return null;

  if (prize.id === "voicebudget") {
    return "Доступ к VoiceBudget придёт в Telegram в течение 5 минут.";
  }
  return "Мы свяжемся с вами для активации приза.";
}

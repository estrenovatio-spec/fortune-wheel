"use client";

import { Button } from "@/components/ui/button";
import type { WheelPrize } from "@/lib/wheel-prizes";
import { getClaimActions, getClaimFootnote } from "@/lib/wheel-claim-actions";

type Props = {
  prize: WheelPrize;
};

export function PrizeClaimSuccess({ prize }: Props) {
  const actions = getClaimActions(prize);
  const footnote = getClaimFootnote(prize);
  const hasTelegramDm = Boolean(prize.telegramDmUrl);
  const hint =
    prize.promoCode && hasTelegramDm
      ? `В первом сообщении укажите код: ${prize.promoCode}`
      : prize.id === "question" && hasTelegramDm
        ? "Сразу напишите свой вопрос одним сообщением"
        : null;

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <p className="text-center text-sm font-medium text-primary">Заявка принята</p>

      {actions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-center text-xs text-muted-foreground">
            {hasTelegramDm ? "Следующий шаг:" : "Ваш приз — по ссылке:"}
          </p>
          {actions.map((action) => (
            <Button key={action.href} asChild className="w-full" size="lg">
              <a href={action.href} target="_blank" rel="noopener noreferrer">
                {action.label}
              </a>
            </Button>
          ))}
          {hint && (
            <p className="text-center text-xs font-medium text-muted-foreground">{hint}</p>
          )}
        </div>
      ) : footnote ? (
        <p className="text-center text-sm text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );
}

# Призы — актуальные тексты

Код: `src/lib/wheel-prizes.ts`  
Ссылки после формы: `src/lib/wheel-claim-actions.ts` + `.env` (`NEXT_PUBLIC_RESOURCE_*`, `NEXT_PUBLIC_BOOKING_URL`)

## Барабан

| Подпись | id | weight |
|---------|-----|--------|
| Чек-лист | checklist | 25 |
| Карта целей | roadmap | 20 |
| Голос | voicebudget | 10 |
| Клуб 7 дней | club | 10 |
| Диагностика | diagnostics | 9 |
| −30% | discount30 | 9 |
| −50% | discount50 | 8 |
| Вопрос | question | 5 |
| −20% | discount20_year | 2 |
| Ещё раз (книга + спин) | retry | 2 |

## После «Забрать приз»

| Приз | Что показывается |
|------|------------------|
| Чек-лист | Кнопка → `NEXT_PUBLIC_RESOURCE_CHECKLIST_URL` |
| Карта целей | Кнопка → `NEXT_PUBLIC_RESOURCE_ROADMAP_URL` |
| Диагностика | [Запись в календарь](https://calendar.app.google/K75gRupshpSXMmLTA) |
| −50% / −30% / −20% | Промокод SPIN50 / SPIN30 / SPIN20 |
| Голос / Клуб / Вопрос | Текст про Telegram |
| Ещё раз | Книга + после заявки ещё один спин |

## Google Таблица

Код готов (`src/lib/google-sheets.ts`). Когда прикрутите — `GOOGLE_SHEETS_WEBHOOK_URL` на Vercel + скрипт из `docs/GOOGLE-SHEETS.md`.

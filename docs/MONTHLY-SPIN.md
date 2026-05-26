# Один спин в месяц и напоминания

## Как работает для пользователя

| Правило | Детали |
|---------|--------|
| Лимит | 1 основной спин в месяц (календарь **Europe/Moscow**) |
| Сброс | С **1-го числа** нового месяца |
| Сектор «Ещё раз» | Книга + **ещё один** спин в **том же** месяце (как раньше) |
| В Mini App | Плашка «Новый месяц — снова можно крутить» |
| 1-го числа | Сообщение от **@Fortuna_Fin_Bot** (если крутили из Mini App) |

## Технически

- Браузер хранит `localStorage` ключ `sg-wheel-period` = `YYYY-MM`.
- При заявке в API уходит `telegramUserId` (из Telegram WebApp) → лист **Напоминания** в Google Таблице.
- **Vercel Cron** 1-го числа вызывает `/api/cron/monthly-wheel-reminder` → рассылка через бота.

## Настройка

1. Обновите Apps Script — `docs/GOOGLE-SHEETS.md`.
2. Vercel: `CRON_SECRET` + Redeploy.
3. Проверка сброса: секретная ссылка `?reset=...` (см. `DEPLOY.md`).

## Как проверить напоминание 1-го числа (не ждать месяц)

### Шаг 1 — вы в списке «Напоминания»

1. Откройте колесо **из Telegram** ([@Fortuna_Fin_Bot](https://t.me/Fortuna_Fin_Bot) → кнопка меню).
2. Крутите → **Забрать приз** (тестовые контакты).
3. В таблице Google появился лист **Напоминания** с вашим `telegram_user_id`.

### Шаг 2 — тестовое сообщение только вам

В терминале (подставьте `CRON_SECRET` с Vercel):

```bash
curl -sS -H "Authorization: Bearer ВАШ_CRON_SECRET" \
  "https://fortune-wheel-snowy.vercel.app/api/cron/monthly-wheel-reminder?test=admin"
```

В Telegram должно прийти сообщение с пометкой **«ТЕСТ — так придёт напоминание 1-го числа»** — тот же текст, что уйдёт всем 1-го числа.

Ответ curl: `{"ok":true,"mode":"test_admin",...}`.

### Шаг 3 — полная рассылка (осторожно)

Без `?test=admin` curl разошлёт **всем** из листа «Напоминания». Для проверки текста хватит шага 2.

### Если тест не пришёл

- Нажали **Start** у @Fortuna_Fin_Bot.
- `TELEGRAM_ADMIN_CHAT_ID` — **число** из @userinfobot, не @username.
- `TELEGRAM_BOT_TOKEN` — от Fortuna_Fin_Bot.
- На Vercel задан `CRON_SECRET`, был **Redeploy**.

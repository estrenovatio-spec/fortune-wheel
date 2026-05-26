# Деплой «Колесо фортуны» на Vercel

Отдельный сайт, не связанный с деплоем `sg-diagnostic`.  
Публичная ссылка: `https://fortune-wheel-xxx.vercel.app` (или свой домен).

---

## Шаг 1. Репозиторий на GitHub

```bash
cd "/Users/bhima/Downloads/апп/fortune-wheel"
git init
git add .
git commit -m "Колесо фортуны SG Capital"
```

На [github.com/new](https://github.com/new) создайте репозиторий `fortune-wheel` (пустой), затем:

```bash
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/fortune-wheel.git
git push -u origin main
```

---

## Шаг 2. Новый проект на Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Импортируйте репозиторий **fortune-wheel** (не sg-diagnostic).
3. Framework: **Next.js** (определится сам).
4. Root Directory: оставьте `/` (корень репо).

---

## Шаг 3. Переменные окружения (Settings → Environment Variables)

| Переменная | Значение |
|------------|----------|
| `NEXT_PUBLIC_SITE_URL` | URL этого проекта после деплоя, напр. `https://fortune-wheel.vercel.app` |
| `NEXT_PUBLIC_DIAGNOSTIC_URL` | Яндекс-форма анкеты: `https://forms.yandex.ru/u/69f6ffac493639605fd288cd` |
| `TELEGRAM_BOT_TOKEN` | Токен **@Fortuna_Fin_Bot** из @BotFather → API Token |
| `TELEGRAM_ADMIN_CHAT_ID` | Ваш числовой Id (см. ниже), **не** @username |

**Уведомления не приходят:** (1) переменные в проекте **fortune-wheel**, не только sg-diagnostic; (2) в [@Fortuna_Fin_Bot](https://t.me/Fortuna_Fin_Bot) нажмите **Start**; (3) `TELEGRAM_ADMIN_CHAT_ID` — только цифры, например `123456789`; (4) токен и chat id от одного бота; (5) **Redeploy** после изменений.
| `GOOGLE_SHEETS_WEBHOOK_URL` | URL Apps Script — заявки на лист **Колесо** (см. `docs/GOOGLE-SHEETS.md`) |
| `NEXT_PUBLIC_RESOURCE_CHECKLIST_URL` | PDF чек-листа (Яндекс.Диск) — **обязательно для кнопки после приза** |
| `NEXT_PUBLIC_RESOURCE_ROADMAP_URL` | Notion «Конструктор целей» |
| `NEXT_PUBLIC_RESOURCE_BOOK_URL` | PDF книги (сектор «Ещё раз») |
| `NEXT_PUBLIC_BOOKING_URL` | Запись на диагностику |
| `NEXT_PUBLIC_CLUB_TELEGRAM_URL` | Ссылка в клуб |

Переменные `NEXT_PUBLIC_*` подставляются **при сборке**. После добавления или изменения — **Redeploy**.

Скопируйте из `.env.example`. **Deploy**.

---

## Шаг 4. Связать с сайтом диагностики

В проекте **sg-diagnostic** на Vercel добавьте:

```
NEXT_PUBLIC_WHEEL_URL=https://ваш-fortune-wheel.vercel.app
```

На главной диагностики появится кнопка «Колесо фортуны».

---

## Локально

```bash
cd fortune-wheel
npm install
npm run dev
```

Откройте [http://localhost:3001](http://localhost:3001) (порт 3001, чтобы не мешать диагностике на 3000).

---

## Призы

Редактируйте `src/lib/wheel-prizes.ts` — подписи, веса (`weight`), тексты.

---

## Сброс для проверки (Mini App / Telegram)

1. Vercel → **Environment Variables** → `NEXT_PUBLIC_WHEEL_RESET_KEY` = длинная случайная строка, например `sg-fortuna-7kQm2p`.
2. **Redeploy**.

Ссылка (подставьте свой домен и секрет):

```text
https://fortune-wheel-snowy.vercel.app/?reset=sg-fortuna-7kQm2p
```

Чтобы сразу выпал нужный приз:

```text
https://fortune-wheel-snowy.vercel.app/?reset=СЕКРЕТ&prize=checklist
```

`prize`: `checklist`, `roadmap`, `retry`, `diagnostics`, `club`, `discount50`, … (id из `wheel-prizes.ts`).

Сохраните ссылку в «Избранное» Telegram — открывайте для теста. Не публикуйте секрет в канале.

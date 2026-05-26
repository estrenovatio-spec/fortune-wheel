# Google Таблица — заявки с колеса фортуны

После нажатия **«Забрать приз»** в таблицу добавляется строка с контактами и выигрышем.

---

## Заголовки листа «Колесо»

Создайте вкладку **Колесо** (или скрипт создаст сам) с первой строкой:

```
дата | ФИО | телефон | telegram | telegram_user_id | период | id приза | приз | подпись | описание | промокод | тип | сайт
```

Лист **Напоминания** (для рассылки 1-го числа) создаётся скриптом:

```
telegram_user_id | telegram | последний_период | обновлено
```

---

## Apps Script

1. Откройте таблицу → **Расширения → Apps Script** (из этой таблицы, не script.google.com).
2. Удалите шаблон `myFunction`.
3. Вставьте код ниже (поддерживает и **колесо**, и **анкету диагностики**, если один URL на оба сайта).

```javascript
function appendLeadRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    data.id || "",
    data.createdAt || "",
    data.fullName || "",
    data.age || "",
    data.city || "",
    data.phone || "",
    data.telegram || "",
    data.profession || "",
    data.incomeLevel || "",
    data.hasDebts || "",
    data.hasSavings || "",
    data.assets || "",
    data.mainPainPoint || "",
    data.goals || "",
    data.advisorBudget || "",
    data.userQuestion || "",
    data.qualification || "",
    data.reportUrl || "",
    data.utmSource || "",
  ]);
}

function getOrCreateWheelSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Колесо");
  if (!sheet) {
    sheet = ss.insertSheet("Колесо");
    sheet.appendRow([
      "дата", "ФИО", "телефон", "telegram", "telegram_user_id", "период",
      "id приза", "приз", "подпись", "описание", "промокод", "тип", "сайт",
    ]);
  }
  return sheet;
}

function getOrCreateRemindersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Напоминания");
  if (!sheet) {
    sheet = ss.insertSheet("Напоминания");
    sheet.appendRow([
      "telegram_user_id", "telegram", "последний_период", "обновлено",
    ]);
  }
  return sheet;
}

function registerWheelReminder(data) {
  const userId = String(data.telegramUserId || "").trim();
  if (!userId) return;

  const sheet = getOrCreateRemindersSheet();
  const rows = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const period = data.spinPeriod || "";

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === userId) {
      sheet.getRange(i + 1, 2, 1, 3).setValues([
        [data.telegram || rows[i][1] || "", period, now],
      ]);
      return;
    }
  }

  sheet.appendRow([userId, data.telegram || "", period, now]);
}

function getReminderUserIds() {
  const sheet = getOrCreateRemindersSheet();
  const rows = sheet.getDataRange().getValues();
  const ids = {};
  for (let i = 1; i < rows.length; i++) {
    const id = Number(rows[i][0]);
    if (id) ids[id] = true;
  }
  return Object.keys(ids).map(Number);
}

function appendWheelRow(data) {
  const sheet = getOrCreateWheelSheet();
  sheet.appendRow([
    data.createdAt || "",
    data.fullName || "",
    data.phone || "",
    data.telegram || "",
    data.telegramUserId || "",
    data.spinPeriod || "",
    data.prizeId || "",
    data.prizeTitle || "",
    data.prizeLabel || "",
    data.prizeDescription || "",
    data.promoCode || "",
    data.prizeType || "",
    data.siteUrl || "",
  ]);
  if (data.telegramUserId) registerWheelReminder(data);
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: "no postData" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.parse(e.postData.contents);

  if (data.type === "wheel_export_reminders") {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, userIds: getReminderUserIds() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.type === "wheel_register_reminder") {
    registerWheelReminder(data);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  }

  if (data.type === "wheel") {
    appendWheelRow(data);
  } else {
    appendLeadRow(data);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** ▶ Выполнить для проверки листа «Колесо» */
function testWheelAppend() {
  appendWheelRow({
    createdAt: new Date().toISOString(),
    fullName: "Тест Колесо",
    phone: "+79990000000",
    telegram: "@test",
    telegramUserId: 123456789,
    spinPeriod: "2026-05",
    prizeId: "checklist",
    prizeTitle: "Чек-лист",
    prizeLabel: "Чек",
    prizeDescription: "Тест",
    siteUrl: "https://fortune-wheel-snowy.vercel.app",
  });
  SpreadsheetApp.flush();
}
```

4. **Сохранить** → **Развернуть** → **Веб-приложение** → доступ **Все** → скопировать URL `/exec`.

---

## Vercel (fortune-wheel)

| Переменная | Значение |
|------------|----------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | URL из развёртывания |

**Redeploy** после добавления переменной.

Тот же URL можно использовать в **sg-diagnostic**, если одна таблица на всё.

---

## Проверка

1. В Apps Script выберите **`testWheelAppend`** → ▶ Выполнить — на листе **Колесо** должна появиться тестовая строка.
2. На сайте: выиграйте приз → **Забрать приз** → строка на **Колесо**.

---

## Не записался контакт — чеклист

### 1. Переменная на том же проекте, где крутите колесо

| Где тестируете | Куда добавить `GOOGLE_SHEETS_WEBHOOK_URL` |
|----------------|-------------------------------------------|
| Локально `localhost:3001` | `fortune-wheel/.env.local` (раскомментируйте строку, URL `/exec`) |
| Vercel | Проект **fortune-wheel** → Settings → Environment Variables → **Redeploy** |

Переменная только в **sg-diagnostic** на колесо **не** действует — нужен отдельный деплой fortune-wheel.

### 2. Скрипт с веткой `wheel`

В `doPost` обязательно:

```javascript
if (data.type === "wheel") {
  appendWheelRow(data);
} else {
  appendLeadRow(data);
}
```

Если вставили старый код без `wheel`, строки уходят не на лист **Колесо** или с пустыми колонками.

После правки кода: **Развернуть → Управление развёртываниями → Новая версия** и обновите URL в Vercel, если URL изменился.

### 3. Логи Vercel

Deployments → последний деплой → **Functions** / **Logs** → ищите `Google Sheets sync failed` или `GOOGLE_SHEETS_WEBHOOK_URL не задан`.

### 4. Быстрый тест webhook из терминала

Подставьте свой URL `/exec`:

```bash
curl -sS -L -X POST "https://script.google.com/macros/s/ВАШ_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"type":"wheel","createdAt":"2026-01-01T12:00:00.000Z","fullName":"Тест curl","phone":"+79991234567","telegram":"@test","prizeId":"checklist","prizeTitle":"Чек-лист","prizeLabel":"Чек","prizeDescription":"","promoCode":"","prizeType":"content","siteUrl":"https://example.com"}'
```

Ответ должен быть `{"ok":true}`, в таблице — новая строка на **Колесо**.

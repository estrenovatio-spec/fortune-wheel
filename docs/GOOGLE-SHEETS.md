# Google Таблица — заявки с колеса фортуны

После нажатия **«Забрать приз»** в таблицу добавляется строка с контактами и выигрышем.

---

## Заголовки листа «Колесо»

Создайте вкладку **Колесо** (или скрипт создаст сам) с первой строкой:

```
дата | ФИО | телефон | telegram | id приза | приз | подпись | описание | промокод | тип | сайт
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
      "дата", "ФИО", "телефон", "telegram", "id приза", "приз",
      "подпись", "описание", "промокод", "тип", "сайт",
    ]);
  }
  return sheet;
}

function appendWheelRow(data) {
  const sheet = getOrCreateWheelSheet();
  sheet.appendRow([
    data.createdAt || "",
    data.fullName || "",
    data.phone || "",
    data.telegram || "",
    data.prizeId || "",
    data.prizeTitle || "",
    data.prizeLabel || "",
    data.prizeDescription || "",
    data.promoCode || "",
    data.prizeType || "",
    data.siteUrl || "",
  ]);
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: "no postData" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.parse(e.postData.contents);
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
    prizeId: "diagnostic-free",
    prizeTitle: "Диагностика бесплатно",
    prizeLabel: "Диагн.",
    prizeDescription: "Тестовая строка",
    siteUrl: "https://example.com",
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

# Лабораторна робота №5
## "Уразливості і захист вебзастосунків"

Виконані сценарії: A (SQLi) + Б (XSS) + В (IDOR) + Г (Misconfiguration)

---

## Сценарій А – SQL Injection (SQLi)
### Було (уразливо)
Усі SQL-запити в репозиторіях будувалися через конкатенацію рядків.
Значення користувача вставлялися прямо в SQL-рядок, що дозволяло змінити структуру запиту.

**Файли:** `backend/src/repositories/event.repository.ts`, `user.repository.ts`, `registration.repository.ts`
**Функції:** `findAll`, `findById`, `create`, `update`, `delete` та інші — кожна містила SQL із конкатенацією.

Приклад (`event.repository.ts:36`):
```typescript
whereClause = `WHERE e.title LIKE '%${esc(params.search)}%'`;
```

### Відтворення
Запит до звичайного пошуку з SQL-ін'єкцією (до виправлення):
```bash
curl.exe -X GET /api/v1/events?search=' OR '1'='1
```
Результат: ін'єкція не проходила через `esc()`, але це було ненадійне екранування. У PDF звіті я показав як можна його обійти.

Запит до демонстраційного вразливого ендпойнту:
```bash
curl.exe -X GET /api/v1/events/unsafe-search?search=' OR '1'='1
```
Результат: повертаються всі події (5), хоча жодна не містить `' OR '1'='1` у назві. Ін'єкція спрацювала.

### Виправлення
1. **`backend/src/db/dbClient.ts`** — додано підтримку параметризованих запитів.
   Функції `all()`, `get()`, `run()` тепер приймають додаткові аргументи-параметри.
2. **Усі репозиторії** переписано на параметризовані запити. Наприклад:
   ```typescript
   // Було:
   run(`INSERT INTO Users (name, email, createdAt) VALUES ('${esc(name)}', '${esc(email)}', '${now}');`);
   // Стало:
   run("INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?);", name, email, now);
   ```
3. **`unsafeSearch`** у event.repository.ts залишено без змін для демонстрації SQLi у звіті.
4. Видалено функцію `esc()` з `dbClient.ts` — вона більше не потрібна.

### Перевірка
Той самий шкідливий ввід після виправлення:
```bash
curl.exe -X GET /api/v1/events?search=' OR '1'='1
```
Результат: `{"items":[],"total":0}` — рядок сприймається як звичайний текст, SQL-ін'єкція не проходить.

Легітимний пошук працює:
```bash
curl.exe -X GET /api/v1/events?search=TypeScript
```
Результат: повертається 1 подія.

---

## Сценарій Б – XSS

### Було (уразливо)
Функції рендерингу таблиць використовували `innerHTML` для вставки даних користувача.
Хоча дані екранувалися через `esc()`, сам підхід з `innerHTML` є небезпечним.

**Файл:** `frontend/src/ui.ts`
**Функції:** `renderEvents` (рядок 71), `renderUsers` (рядок 99), `renderRegistrations` (рядок 117)

Приклад (`ui.ts:71`):
```typescript
tr.innerHTML = `
  <td>${esc(ev.title)}</td>
  ...
  <button data-action="edit-event" data-id="${ev.id}">Ред</button>
  ...`;
```

### Відтворення
Створення події з назвою: `<script>alert(1)</script>`
До виправлення: браузер виконав би скрипт (хоча `esc()` екранував би `<` та `>`, але при збої в екрануванні можлива XSS).

### Виправлення
Усі три функції рендерингу (`renderEvents`, `renderUsers`, `renderRegistrations`) переписано з використанням DOM API:
- `document.createElement("tr")`, `document.createElement("td")`
- `element.textContent = value` замість вставки через innerHTML
- Кнопки створюються через `document.createElement("button")` з встановленням `dataset` атрибутів

Приклад:
```typescript
// Було:
tr.innerHTML = `<td>${esc(ev.title)}</td>...`;
// Стало:
const cell = document.createElement("td");
cell.textContent = ev.title;
tr.appendChild(cell);
```

### Перевірка
Створення події з назвою `<b>bold</b>`:
- До виправлення: тег `b` міг бути інтерпретований HTML
- Після виправлення: текст відображається як `<b>bold</b>` без форматування

Легітимні дані відображаються коректно.

---

## Сценарій В – Broken Access Control / IDOR

### Було (уразливо)
Реєстрації на події не мали жодної перевірки власника.
Будь-який користувач міг отримати список всіх реєстрацій, переглянути/видалити чужу реєстрацію,
знаючи її ID.

**Файли:** Усі CRUD-операції з `Registrations` не фільтрували за `userId`.

### Відтворення
До виправлення:
```bash
curl.exe -X GET /api/v1/registrations
```
Повертав всі реєстрації всіх користувачів.

### Виправлення
1. **Додано middleware `demo-auth.middleware.ts`:**
   - Читає заголовок `X-Demo-UserId`
   - Валідує: ціле число ≥ 1, користувач існує в БД
   - Повертає 401 при відсутності/невалідності заголовка
   - Встановлює `req.user.id`

2. **`index.ts`:** middleware застосовано до всіх маршрутів `/api/v1/registrations`

3. **`registration.service.ts`:** додано параметр `currentUserId` у всі методи:
   - `getAll` — фільтрує тільки реєстрації поточного користувача
   - `getById` — перевіряє `reg.userId !== currentUserId` → 404
   - `create` — використовує `currentUserId` замість `body.userId`
   - `update/patch` — перевіряє ownership
   - `delete` — перевіряє ownership

### Перевірка
Запит без заголовка:
```bash
curl.exe -X GET /api/v1/registrations
```
Результат: 401, `{"error":{"code":"UNAUTHORIZED",...}}`

Запит з неіснуючим користувачем:
```
GET /api/v1/registrations
X-Demo-UserId: 999
```
Результат: 401, "User not found"

Запит з існуючим користувачем (id=1):
```
GET /api/v1/registrations
X-Demo-UserId: 1
```
Результат: 200, тільки реєстрації користувача з id=1

Спроба доступу до чужої реєстрації:
```
GET /api/v1/registrations/5
X-Demo-UserId: 1
```
(реєстрація 5 належить userId=3) → 404

---

## Сценарій Г – Security Misconfiguration

### Було (уразливо)
- CORS дозволяв обмежений набір origin (але X-Demo-UserId не був в allowedHeaders)
- Відсутні базові security-заголовки (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Помилки вже мали чистий формат (без stack trace назовні)

### Виправлення
1. **Додано `security-headers.middleware.ts`:**
   - `X-Content-Type-Options: nosniff` — запобігає MIME-сніфінгу
   - `X-Frame-Options: DENY` — захист від clickjacking
   - `Referrer-Policy: no-referrer` — контроль Referer-заголовка

2. **Оновлено CORS-конфігурацію:**
   - Додано `"X-Demo-UserId"` до `allowedHeaders`

3. **Помилки (`error-handler.middleware.ts`):**
   - Вже мали чистий формат без stack trace назовні
   - Додано 401 для demoAuth

### Перевірка
Заголовки у відповіді:
```bash
curl.exe -X GET "http://localhost:3000/health" -v 2>&1 | findstr "X-Content-Type-Options X-Frame-Options Referrer-Policy"
```
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

CORS з X-Demo-UserId (preflight):
```bash
curl.exe -X OPTIONS "http://localhost:3000/api/v1/registrations" -H "Origin: http://localhost:5500" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: x-demo-user-id" -v 2>&1 | findstr "Access-Control"
```
```
OPTIONS /api/v1/registrations
Origin: http://localhost:5500
Access-Control-Request-Method: GET
Access-Control-Request-Headers: x-demo-user-id
```
Відповідь: 204 з `Access-Control-Allow-Origin: http://localhost:5500`

Помилка без заголовка:
```bash
curl.exe -X GET /api/v1/registrations
```
Відповідь: 401, без stack trace.
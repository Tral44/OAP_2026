# Лабораторна робота №5 (Варіант 7)

REST API для реєстрації користувачів на події з TypeScript-фронтендом.

---

## Як запустити

### 1. Бекенд

```bash
cd backend
npm install
npm run seed   # наповнити БД тестовими даними
npm start      # або npm run dev для режиму розробки
```

Сервер запускається на `http://localhost:3000`. API має префікс `/api/v1/`.

### 2. Фронтенд

```bash
cd frontend
npm install
npm run build   # компіляція TypeScript → public/js/
npx http-server public -p 5500
```

Відкрити в браузері: `http://localhost:5500`

> Фронтенд обов'язково запускати через HTTP-сервер (не file://), інакше CORS і модулі не працюватимуть.

---

## API Endpoints (v1)

### Users (`/api/v1/users`)
| Метод  | Шлях                 | Опис
|--------|----------------------|----------------------------------------------
| GET    | /api/v1/users        | Список користувачів (search, sortBy, sortDir)
| GET    | /api/v1/users/:id    | Отримати користувача
| POST   | /api/v1/users        | Створити користувача
| PUT    | /api/v1/users/:id    | Оновити користувача
| DELETE | /api/v1/users/:id    | Видалити користувача

### Events (`/api/v1/events`)
| Метод  | Шлях                  | Опис
|--------|-----------------------|-------------------------------------------------------
| GET    | /api/v1/events        | Список подій (search, sortBy, sortDir, page, pageSize)
| GET    | /api/v1/events/stats  | Статистика подій
| GET    | /api/v1/events/:id    | Отримати подію
| POST   | /api/v1/events        | Створити подію
| PUT    | /api/v1/events/:id    | Оновити подію
| DELETE | /api/v1/events/:id    | Видалити подію

### Registrations (`/api/v1/registrations`)
| Метод  | Шлях                         | Опис
|--------|------------------------------|------------------------------------
| GET    | /api/v1/registrations        | Список реєстрацій
| POST   | /api/v1/registrations        | Зареєструвати користувача на подію
| DELETE | /api/v1/registrations/:id    | Скасувати реєстрацію

---

## Сценарії перевірки

### 1. GET — список подій
```bash
curl.exe "http://localhost:3000/api/v1/events"
```
Очікуваний результат: JSON з `{ items: [...], total: N }`. Статус 200.

### 2. GET — деталі події
```bash
curl.exe "http://localhost:3000/api/v1/events/1"
```
Очікуваний результат: JSON з даними події. Статус 200.

### 3. POST — створення події
```bash
curl.exe -X POST http://localhost:3000/api/v1/events -H "Content-Type: application/json" -d '{"title":"Нова подія","date":"2026-12-01","location":"Аудиторія 101","capacity":20,"description":"Опис нової події"}'
```
або для powershell:
```bash
curl.exe --% -X POST http://localhost:3000/api/v1/events -H "Content-Type: application/json" -d "{\"title\":\"Нова подія\",\"date\":\"2026-12-01\",\"location\":\"Аудиторія 101\",\"capacity\":20,\"description\":\"Опис нової події\"}"
```
Очікуваний результат: статус 201, JSON зі створеною подією.

### 4. PUT — оновлення події
```bash
curl.exe -X PUT http://localhost:3000/api/v1/events/1 -H "Content-Type: application/json" -d '{"title":"Оновлена подія","date":"2026-12-15","location":"Аудиторія 202","capacity":35,"description":"Оновлений опис"}'
```
або для powershell:
```bash
curl.exe --% -X PUT http://localhost:3000/api/v1/events/1 -H "Content-Type: application/json" -d "{\"title\":\"Оновлена подія\",\"date\":\"2026-12-15\",\"location\":\"Аудиторія 202\",\"capacity\":35,\"description\":\"Оновлений опис\"}"
```
Очікуваний результат: статус 200.

### 5. DELETE — видалення події
```bash
curl.exe -X DELETE http://localhost:3000/api/v1/events/6
```
Очікуваний результат: статус 204 (No Content).

### 6. Помилка валідації (400)
```bash
curl.exe -X POST http://localhost:3000/api/v1/events -H "Content-Type: application/json" -d '{"title":"","date":"bad-date","location":"","capacity":0,"description":""}'
```
або для powershell:
```bash
curl.exe --% -X POST http://localhost:3000/api/v1/events -H "Content-Type: application/json" -d "{\"title\":\"\",\"date\":\"bad-date\",\"location\":\"\",\"capacity\":0,\"description\":\"\"}"
```
Очікуваний результат: статус 400, JSON з `{ error: { code: "VALIDATION_ERROR", details: [...] } }`.

### 7. Помилка 404 — неіснуючий ресурс
```bash
curl.exe "http://localhost:3000/api/v1/events/99999"
```
Очікуваний результат: статус 404, `{ error: { code: "NOT_FOUND", ... } }`.

### 8. Помилка 409 — конфлікт (дублікат реєстрації)
```bash
curl.exe -X POST http://localhost:3000/api/v1/registrations -H "Content-Type: application/json" -d '{"eventId":1,"userId":1}'
```
або для powershell:
```bash
curl.exe --% -X POST http://localhost:3000/api/v1/registrations -H "Content-Type: application/json" -d "{\"eventId\":1,\"userId\":1}"
```
Очікуваний результат: статус 409.

### 9. Перевірка CORS
```bash
curl.exe -X OPTIONS http://localhost:3000/api/v1/events -H "Origin: http://localhost:5500" -H "Access-Control-Request-Method: GET" -v 2>&1 | findstr "Access-Control"
```
Очікуваний результат: заголовки `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.

### 10. Таймаут запиту (фронтенд)

Вимкнути бекенд → спробувати завантажити список подій у фронтенді. Очікуваний результат: повідомлення "Помилка мережі або CORS" через 15 секунд.

---

## Структура проєкту

```
LAB 5/
├── backend/
│   ├── src/
│   │   ├── index.ts           # точка входу (CORS + /api/v1)
│   │   ├── controllers/       # контролери Express
│   │   ├── db/                # SQLite (db.ts, dbClient.ts, migrate.ts, seed.ts)
│   │   ├── dtos/              # DTO (contracts)
│   │   ├── middleware/        # api-error, error-handler, validation, request-logging
│   │   ├── migrations/        # SQL-міграції
│   │   ├── repositories/     # рівень доступу до даних
│   │   ├── routes/            # маршрутизація
│   │   └── services/          # бізнес-логіка
│   ├── data/                  # SQLite БД
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   ├── index.html          # HTML
│   │   ├── styles.css          # стилі
│   │   └── js/                 # скомпільований JS (з src/)
│   ├── src/
│   │   ├── config.ts           # API_BASE_URL
│   │   ├── dtos.ts             # типізовані DTO
│   │   ├── apiClient.ts        # HTTP-шар (fetch + AbortController + timeout)
│   │   ├── ui.ts               # DOM-операції
│   │   └── main.ts             # точка входу, обробники подій
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Принцип "не ламати формат" (Backward Compatibility)

1. **Не перейменовувати та не видаляти поля DTO**   у v1 — фронтенд покладається на поточну структуру.
2. **Нові поля додаються як необов'язкові**         (`?` в TypeScript) або з дефолтними значеннями.
3. **Breaking changes**                             допускаються лише з новою версією API (`/api/v2/...`).
4. **Фронтенд має дефолтні значення**               для `null`/`undefined` та незнайомих enum-значень.

### Приклади сумісних змін:
Додавання нового поля (фронтенд ігнорує)
Розширення enum новими значеннями (фронтенд показує "—" для незнайомих)

### Приклади несумісних змін (breaking):
Перейменування  `title` → `name`
Видалення поля  `date`
Зміна типу      `capacity: number` → `capacity: string`

# Лабораторна робота №3 Варіант 7

---

## Як запустити

```bash
# Встановити залежності (у папці backend)
npm install

# Запустити сервер
npm start

# В режимі розробки
npm run dev

# Наповнити БД тестовими даними
npm run seed
```

Сервер запускається на `http://localhost:3000`. Файл БД створюється в `./data/app.db`.

---

## Схема бази даних
### Таблиці

#### Users
| Поле      | Тип     | Обмеження                                          
|-----------|---------|---------------------------------------------------------------------
| id        | INTEGER | PRIMARY KEY
| name      | TEXT    | NOT NULL, CHECK(length >= 2)
| email     | TEXT    | NOT NULL, UNIQUE
| role      | TEXT    | NOT NULL, DEFAULT 'student', CHECK(IN ('student','teacher','guest'))
| createdAt | TEXT    | NOT NULL

#### Events
| Поле        | Тип     | Обмеження
|-------------|---------|-----------------------------
| id          | INTEGER | PRIMARY KEY
| title       | TEXT    | NOT NULL, CHECK(length >= 2)
| date        | TEXT    | NOT NULL 
| location    | TEXT    | NOT NULL, CHECK(length >= 2)
| capacity    | INTEGER | NOT NULL, CHECK(>= 1)
| description | TEXT    | NOT NULL, CHECK(length >= 1)
| createdAt   | TEXT    | NOT NULL

#### Registrations
| Поле         | Тип     | Обмеження
|--------------|---------|-------------------------------------------------------------
| id           | INTEGER | PRIMARY KEY
| eventId      | INTEGER | NOT NULL, FK → Events(id) ON DELETE CASCADE
| userId       | INTEGER | NOT NULL, FK → Users(id) ON DELETE CASCADE
| status       | TEXT    | NOT NULL, DEFAULT 'active', CHECK(IN ('active','cancelled'))
| registeredAt | TEXT    | NOT NULL
|              |         | UNIQUE(eventId, userId)

### Зв'язки

**Users   1:N   Registrations**               — один користувач може реєструватись на багато подій
**Events  1:N   Registrations**               — на одну подію можуть зареєструватись багато користувачів
**Users   M:N   Events**(через Registrations) — багато користувачів <-> багато подій

### Обмеження цілісності

**NOT NULL**    — всі обов'язкові поля
**UNIQUE**      — email у Users, (eventId, userId) у Registrations
**CHECK**       — name/title/location/description (довжина), capacity (>0), role та status (набір значень)
**FOREIGN KEY** — ON DELETE CASCADE для каскадного видалення

### Індекси

- `idx_events_date`           — прискорення пошуку за датою
- `idx_registrations_eventId` — прискорення пошуку реєстрацій за подією
- `idx_registrations_userId`  — прискорення пошуку реєстрацій за користувачем

---

## API Endpoints

### Users (`/api/users`)
| Метод   | Шлях            | Опис
|---------|-----------------|--------------------------------------------------------------
| GET     | /api/users      | Список користувачів (search, sortBy, sortDir, page, pageSize)
| GET     | /api/users/:id  | Отримати користувача за ID
| POST    | /api/users      | Створити користувача
| PUT     | /api/users/:id  | Оновити користувача повністю
| DELETE  | /api/users/:id  | Видалити користувача

### Events (`/api/events`)
| Метод   | Шлях                          | Опис 
|---------|-------------------------------|-------------------------------------------------------------------------
| GET     | /api/events                   | Список подій (search, dateFrom, dateTo, sortBy, sortDir, page, pageSize)
| GET     | /api/events/stats             | Статистика: к-сть реєстрацій та вільних місць (COUNT + GROUP BY)
| GET     | /api/events/unsafe-search?q=  | Пошук з SQL-ін'єкцією (демонстрація)
| GET     | /api/events/:id               | Отримати подію за ID
| GET     | /api/events/:id/registrations | Список реєстрацій на подію (з даними користувача)
| POST    | /api/events                   | Створити подію
| PUT     | /api/events/:id               | Оновити подію повністю
| DELETE  | /api/events/:id               | Видалити подію

### Registrations (`/api/registrations`)
| Метод   | Шлях                    | Опис
|---------|-------------------------|-----------------------------------------------------------------------------
| GET     | /api/registrations      | Список реєстрацій (eventId, userId, status, sortBy, sortDir, page, pageSize)
| GET     | /api/registrations/:id  | Отримати реєстрацію за ID
| POST    | /api/registrations      | Зареєструвати користувача на подію
| DELETE  | /api/registrations/:id  | Видалити реєстрацію

---

## Приклади запитів за допомогою curl.exe

### 1. Створити користувача
```bash
curl.exe -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Тестовий Користувач","email":"test@example.com","role":"student"}'
```
Або для Powershell:
```bash
curl.exe --% -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Тестовий Користувач222\",\"email\":\"test@example.com\",\"role\":\"student\"}"
```

### 2. Список подій з фільтрацією та сортуванням (WHERE + ORDER BY + LIMIT)
```bash
curl.exe "http://localhost:3000/api/events?search=TypeScript&sortBy=date&sortDir=asc&pageSize=5"
```

### 3. Статистика подій (агрегація COUNT + GROUP BY)
```bash
curl.exe "http://localhost:3000/api/events/stats"
```

### 4. Зареєструвати користувача на подію
```bash
curl.exe -X POST http://localhost:3000/api/registrations -H "Content-Type: application/json" -d '{"eventId":1,"userId":1}'
```
Або для Powershell:
```bash
curl.exe --% -X POST http://localhost:3000/api/registrations -H "Content-Type: application/json" -d "{\"eventId\":1,\"userId\":1}"
```

### 5. Список реєстрацій з JOIN (дані користувача + події)
```bash
curl.exe "http://localhost:3000/api/registrations?eventId=1"
```

---

## SQL-ін'єкція: демонстрація

Endpoint `/api/events/unsafe-search?q=` використовує рядкову конкатенацію без екранування:

```sql
SELECT * FROM Events WHERE title LIKE '%${q}%' OR description LIKE '%${q}%'
```

Це дозволяє ввести шкідливий запит. Наприклад:

GET /api/events/unsafe-search?q=' OR 1=1 --


Результат: повернуться **всі** події, ігноруючи пошук. Ще небезпечніше:

GET /api/events/unsafe-search?q='; DELETE FROM Events --


**Чому це небезпечно:** зловмисник може змінити логіку SQL-запиту, отримати несанкціонований доступ або пошкодити дані.

**Як виправити:** використовувати параметризовані запити (placeholder `?`), які відокремлюють код від даних.

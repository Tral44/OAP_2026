## Запуск

```bash
# 1. Встановити залежності
npm install

# 2. Запустити в режимі розробки
npm run dev

# 3. Зібрати
npm run build

# 4. Запустити зібрану версію
npm start

# Перевірка коду
npm run lint
npm run format
```

Сервер запускається на `http://localhost:3000`



## Сутності

| **Events**          Події
| **Users**           Користувачі
| **Registrations**   Реєстрації користувачів на події



## Приклади curl

### Health check
```bash
curl -i http://localhost:3000/health
```

### Створити користувача
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Іваненко","email":"ivan@example.com"}'
```

### Отримати список користувачів
```bash
curl -i http://localhost:3000/api/users
```

### Створити подію
```bash
curl -i -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CTF",
    "date": "2026-09-15",
    "location": "Аудиторія 301",
    "capacity": 30,
    "description": "CTF"
  }'
```

### Отримати список подій з фільтрацією
```bash
curl -i "http://localhost:3000/api/events?search=TypeScript&sortBy=date&sortDir=asc"
```

### Отримати одну подію
```bash
curl -i http://localhost:3000/api/events/{id}
```

### Оновити подію
```bash
curl -i -X PUT http://localhost:3000/api/events/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Факультатив з TypeScript (оновлено)",
    "date": "2026-09-20",
    "location": "Аудиторія 401",
    "capacity": 40,
    "description": "Оновлений опис"
  }'
```

### Частково оновити подію
```bash
curl -i -X PATCH http://localhost:3000/api/events/{id} \
  -H "Content-Type: application/json" \
  -d '{"capacity": 50}'
```

### Зареєструватися на подію
```bash
curl -i -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{"eventId":"{eventId}","userId":"{userId}"}'
```

### Отримати реєстрації конкретної події
```bash
curl -i http://localhost:3000/api/events/{eventId}/registrations
```

### Видалити подію
```bash
curl -i -X DELETE http://localhost:3000/api/events/{id}
```
import { migrate } from "./migrate.js";
import { run } from "./dbClient.js";

async function seed(): Promise<void> {
  await migrate();

  const now = new Date().toISOString();

  console.log("Seeding users...");
  run(`INSERT OR IGNORE INTO Users (name, email, createdAt) VALUES ('Іван Петренко', 'ivan@example.com', '${now}');`);
  run(`INSERT OR IGNORE INTO Users (name, email, createdAt) VALUES ('Марія Коваль', 'maria@example.com', '${now}');`);
  run(`INSERT OR IGNORE INTO Users (name, email, createdAt) VALUES ('Олег Сидоренко', 'oleg@example.com', '${now}');`);
  run(`INSERT OR IGNORE INTO Users (name, email, createdAt) VALUES ('Анна Бондаренко', 'anna@example.com', '${now}');`);
  run(`INSERT OR IGNORE INTO Users (name, email, createdAt) VALUES ('Дмитро Ткаченко', 'dmytro@example.com', '${now}');`);

  console.log("Seeding events...");
  run(
    `INSERT OR IGNORE INTO Events (title, date, location, capacity, description, createdAt) VALUES ('Факультатив з TypeScript', '2026-09-15', 'Аудиторія 301', 30, 'Введення в TypeScript для початківців', '${now}');`,
  );
  run(
    `INSERT OR IGNORE INTO Events (title, date, location, capacity, description, createdAt) VALUES ('Воркшоп з React', '2026-09-22', 'Аудиторія 205', 25, 'Практичний воркшоп зі створення React-застосунків', '${now}');`,
  );
  run(
    `INSERT OR IGNORE INTO Events (title, date, location, capacity, description, createdAt) VALUES ('Лекція з баз даних', '2026-10-01', 'Велика аула', 100, 'Основи реляційних баз даних і SQL', '${now}');`,
  );
  run(
    `INSERT OR IGNORE INTO Events (title, date, location, capacity, description, createdAt) VALUES ('Хакатон Open Data', '2026-07-01', 'Коворкінг CreativeSpace', 50, 'Командна розробка проєктів з відкритими даними', '${now}');`,
  );
  run(
    `INSERT OR IGNORE INTO Events (title, date, location, capacity, description, createdAt) VALUES ('Конференція AI Ukraine', '2026-08-05', 'Конгрес-хол', 200, 'Штучний інтелект та машинне навчання', '${now}');`,
  );

  console.log("Seeding registrations...");
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (1, 1, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (1, 2, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (2, 1, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (2, 3, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (2, 4, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (3, 5, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (3, 2, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (4, 3, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (5, 1, '${now}');`);
  run(`INSERT OR IGNORE INTO Registrations (eventId, userId, registeredAt) VALUES (5, 4, '${now}');`);

  console.log("Seed completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

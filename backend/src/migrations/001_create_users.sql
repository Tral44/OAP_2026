CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) >= 2),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'teacher', 'guest')),
  createdAt TEXT NOT NULL
);

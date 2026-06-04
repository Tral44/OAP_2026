CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(trim(title)) >= 2),
  date TEXT NOT NULL,
  location TEXT NOT NULL CHECK(length(trim(location)) >= 2),
  capacity INTEGER NOT NULL CHECK(capacity >= 1),
  description TEXT NOT NULL CHECK(length(trim(description)) >= 1),
  createdAt TEXT NOT NULL
);

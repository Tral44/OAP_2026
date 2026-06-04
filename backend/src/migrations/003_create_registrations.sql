CREATE TABLE IF NOT EXISTS Registrations (
  id INTEGER PRIMARY KEY,
  eventId INTEGER NOT NULL REFERENCES Events(id) ON DELETE CASCADE,
  userId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'cancelled')),
  registeredAt TEXT NOT NULL,
  UNIQUE(eventId, userId)
);

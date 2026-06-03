CREATE INDEX IF NOT EXISTS idx_events_date ON Events(date);
CREATE INDEX IF NOT EXISTS idx_registrations_eventId ON Registrations(eventId);
CREATE INDEX IF NOT EXISTS idx_registrations_userId ON Registrations(userId);

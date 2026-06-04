import { DatabaseSync } from "node:sqlite";
import path from "path";

const DATA_DIR = path.join(import.meta.dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec("PRAGMA journal_mode = WAL;");
    _db.exec("PRAGMA foreign_keys = ON;");
    console.log("[DB] SQLite opened:", DB_PATH);
  }
  return _db;
}

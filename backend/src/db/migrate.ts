import fs from "fs";
import path from "path";
import { run, all, exec } from "./dbClient.js";

type MigrationRow = { filename: string };

export async function migrate(): Promise<void> {
  exec("PRAGMA foreign_keys = ON;");

  run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id        INTEGER PRIMARY KEY,
      filename  TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(import.meta.dirname, "..", "migrations");

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort();

  const applied = all<MigrationRow>("SELECT filename FROM schema_migrations;");
  const appliedSet = new Set(applied.map((x) => x.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8").trim();
    if (!sql) continue;

    run(sql);

    const now = new Date().toISOString();
    run("INSERT INTO schema_migrations (filename, appliedAt) VALUES (?, ?);", file, now);

    console.log(`Migration applied: ${file}`);
  }

  console.log("DB migrations done");
}

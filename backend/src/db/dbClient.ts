import { getDb } from "./db.js";

export function all<T = Record<string, unknown>>(sql: string): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all() as T[];
}

export function get<T = Record<string, unknown>>(sql: string): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get() as T | undefined;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export function run(sql: string): RunResult {
  const stmt = getDb().prepare(sql);
  const result = stmt.run();
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function exec(sql: string): void {
  getDb().exec(sql);
}

export function esc(value: string): string {
  return String(value).replace(/'/g, "''");
}

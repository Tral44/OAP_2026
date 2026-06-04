import { getDb } from "./db.js";
import type { SQLInputValue } from "node:sqlite";

export function all<T = Record<string, unknown>>(sql: string, ...params: SQLInputValue[]): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params) as T[];
}

export function get<T = Record<string, unknown>>(sql: string, ...params: SQLInputValue[]): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params) as T | undefined;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export function run(sql: string, ...params: SQLInputValue[]): RunResult {
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function exec(sql: string): void {
  getDb().exec(sql);
}

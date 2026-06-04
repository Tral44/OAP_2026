import { all, get, run } from "../db/dbClient.js";
import type { SQLInputValue } from "node:sqlite";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export const userRepository = {
  findAll(
    params: { sortBy?: string; sortDir?: string; search?: string; page?: number; pageSize?: number } = {},
  ): { rows: UserRow[]; total: number } {
    const allowedSort = ["id", "name", "email", "createdAt"];
    const sortBy = allowedSort.includes(params.sortBy ?? "") ? params.sortBy : "id";
    const sortDir = params.sortDir === "asc" ? "ASC" : "DESC";
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const searchParam = params.search ?? "";
    let whereClause = "";
    const searchArgs: SQLInputValue[] = [];
    if (searchParam) {
      whereClause = "WHERE name LIKE ? OR email LIKE ?";
      searchArgs.push(`%${searchParam}%`, `%${searchParam}%`);
    }

    const countRow = get<{ total: number }>(`SELECT COUNT(*) AS total FROM Users ${whereClause};`, ...searchArgs);
    const total = countRow?.total ?? 0;

    const listArgs = [...searchArgs, Number(pageSize), Number(offset)];

    const rows = all<UserRow>(`
      SELECT id, name, email, createdAt FROM Users ${whereClause} ORDER BY ${sortBy} ${sortDir} LIMIT ? OFFSET ?;
    `, ...listArgs);

    return { rows, total };
  },

  findById(id: number): UserRow | undefined {
    return get<UserRow>("SELECT id, name, email, createdAt FROM Users WHERE id = ?;", id);
  },

  findByEmail(email: string): UserRow | undefined {
    return get<UserRow>("SELECT id, name, email, createdAt FROM Users WHERE email = ?;", email);
  },

  create(name: string, email: string): UserRow {
    const now = new Date().toISOString();
    const result = run("INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?);", name, email, now);
    return this.findById(result.lastInsertRowid)!;
  },

  update(id: number, name: string, email: string): UserRow | undefined {
    const result = run("UPDATE Users SET name = ?, email = ? WHERE id = ?;", name, email, id);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },

  patch(id: number, data: { name?: string; email?: string }): UserRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const sets: string[] = [];
    const vals: SQLInputValue[] = [];
    if (data.name !== undefined) { sets.push("name = ?"); vals.push(data.name); }
    if (data.email !== undefined) { sets.push("email = ?"); vals.push(data.email); }

    if (sets.length === 0) return existing;

    run(`UPDATE Users SET ${sets.join(", ")} WHERE id = ?;`, ...vals, id);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = run("DELETE FROM Users WHERE id = ?;", id);
    return result.changes > 0;
  },
};

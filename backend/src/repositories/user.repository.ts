import { all, get, run, esc } from "../db/dbClient.js";

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

    let whereClause = "";
    if (params.search) {
      whereClause = `WHERE name LIKE '%${esc(params.search)}%' OR email LIKE '%${esc(params.search)}%'`;
    }

    const countRow = get<{ total: number }>(`SELECT COUNT(*) AS total FROM Users ${whereClause};`);
    const total = countRow?.total ?? 0;

    const rows = all<UserRow>(`
      SELECT id, name, email, createdAt FROM Users ${whereClause} ORDER BY ${sortBy} ${sortDir} LIMIT ${Number(pageSize)} OFFSET ${Number(offset)};
    `);

    return { rows, total };
  },

  findById(id: number): UserRow | undefined {
    return get<UserRow>(`SELECT id, name, email, createdAt FROM Users WHERE id = ${Number(id)};`);
  },

  findByEmail(email: string): UserRow | undefined {
    return get<UserRow>(`SELECT id, name, email, createdAt FROM Users WHERE email = '${esc(email)}';`);
  },

  create(name: string, email: string): UserRow {
    const now = new Date().toISOString();
    const result = run(
      `INSERT INTO Users (name, email, createdAt) VALUES ('${esc(name)}', '${esc(email)}', '${now}');`,
    );
    return this.findById(result.lastInsertRowid)!;
  },

  update(id: number, name: string, email: string): UserRow | undefined {
    const result = run(`UPDATE Users SET name = '${esc(name)}', email = '${esc(email)}' WHERE id = ${Number(id)};`);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },

  patch(id: number, data: { name?: string; email?: string }): UserRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const sets: string[] = [];
    if (data.name !== undefined) sets.push(`name = '${esc(data.name)}'`);
    if (data.email !== undefined) sets.push(`email = '${esc(data.email)}'`);

    if (sets.length === 0) return existing;

    run(`UPDATE Users SET ${sets.join(", ")} WHERE id = ${Number(id)};`);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = run(`DELETE FROM Users WHERE id = ${Number(id)};`);
    return result.changes > 0;
  },
};

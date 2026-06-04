import { all, get, run } from "../db/dbClient.js";
import type { SQLInputValue } from "node:sqlite";

export interface EventRow {
  id: number;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
  createdAt: string;
}

export interface EventRowWithCount extends EventRow {
  registrationCount: number;
}

export const eventRepository = {
  findAll(
    params: {
      search?: string;
      sortBy?: string;
      sortDir?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): { rows: EventRowWithCount[]; total: number } {
    const allowedSort = ["id", "title", "date", "location", "capacity", "createdAt"];
    const sortBy = allowedSort.includes(params.sortBy ?? "") ? `e.${params.sortBy}` : "e.id";
    const sortDir = params.sortDir === "asc" ? "ASC" : "DESC";
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const searchParam = params.search ?? "";
    let whereClause = "";
    const countArgs: SQLInputValue[] = [];
    if (searchParam) {
      whereClause = "WHERE e.title LIKE ?";
      countArgs.push(`%${searchParam}%`);
    }

    const countRow = get<{ total: number }>(`SELECT COUNT(*) AS total FROM Events e ${whereClause};`, ...countArgs);
    const total = countRow?.total ?? 0;

    const listArgs: SQLInputValue[] = [];
    if (searchParam) {
      listArgs.push(`%${searchParam}%`);
    }
    listArgs.push(Number(pageSize), Number(offset));

    const rows = all<EventRowWithCount>(`
      SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt,
             COUNT(r.id) AS registrationCount
      FROM Events e
      LEFT JOIN Registrations r ON r.eventId = e.id
      ${whereClause}
      GROUP BY e.id
      ORDER BY ${sortBy} ${sortDir}
      LIMIT ? OFFSET ?;
    `, ...listArgs);

    return { rows, total };
  },

  findById(id: number): EventRowWithCount | undefined {
    return get<EventRowWithCount>(`
      SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt,
             COUNT(r.id) AS registrationCount
      FROM Events e
      LEFT JOIN Registrations r ON r.eventId = e.id
      WHERE e.id = ?
      GROUP BY e.id;
    `, id);
  },

  getStats(): {
    totalEvents: number;
    totalCapacity: number;
    totalRegistrations: number;
    avgDescriptionWordCapacity: number;
  } {
    const row = get<{
      totalEvents: number;
      totalCapacity: number;
      totalRegistrations: number;
      avgDescriptionWordCapacity: number;
    }>(`
      SELECT COUNT(DISTINCT e.id) AS totalEvents,
            SUM(e.capacity) AS totalCapacity,
            COUNT(r.id) AS totalRegistrations,
            AVG(
              CASE
                WHEN e.description IS NULL OR TRIM(e.description) = '' THEN 0
                ELSE LENGTH(TRIM(e.description)) - LENGTH(REPLACE(TRIM(e.description), ' ', '')) + 1
              END
            ) AS avgDescriptionWordCapacity
      FROM Events e
      LEFT JOIN Registrations r ON r.eventId = e.id;
    `);
    return row ?? { totalEvents: 0, totalCapacity: 0, totalRegistrations: 0, avgDescriptionWordCapacity: 0 };
  },

  create(data: {
    title: string;
    date: string;
    location: string;
    capacity: number;
    description: string;
  }): EventRowWithCount {
    const now = new Date().toISOString();
    const result = run(`
      INSERT INTO Events (title, date, location, capacity, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?);
    `, data.title, data.date, data.location, Number(data.capacity), data.description, now);
    return this.findById(result.lastInsertRowid)!;
  },

  update(
    id: number,
    data: { title: string; date: string; location: string; capacity: number; description: string },
  ): EventRowWithCount | undefined {
    const result = run(`
      UPDATE Events SET title = ?, date = ?, location = ?, capacity = ?, description = ?
      WHERE id = ?;
    `, data.title, data.date, data.location, Number(data.capacity), data.description, id);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },

  patch(
    id: number,
    data: Partial<{ title: string; date: string; location: string; capacity: number; description: string }>,
  ): EventRowWithCount | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const sets: string[] = [];
    const vals: SQLInputValue[] = [];
    if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title); }
    if (data.date !== undefined) { sets.push("date = ?"); vals.push(data.date); }
    if (data.location !== undefined) { sets.push("location = ?"); vals.push(data.location); }
    if (data.capacity !== undefined) { sets.push("capacity = ?"); vals.push(Number(data.capacity)); }
    if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description); }

    if (sets.length === 0) return existing;

    run(`UPDATE Events SET ${sets.join(", ")} WHERE id = ?;`, ...vals, id);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = run("DELETE FROM Events WHERE id = ?;", id);
    return result.changes > 0;
  },

  unsafeSearch(searchTerm: string): EventRowWithCount[] {
    const sql = `SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt, COUNT(r.id) AS registrationCount FROM Events e LEFT JOIN Registrations r ON r.eventId = e.id WHERE (e.title LIKE '%${searchTerm}%' OR e.description LIKE '%${searchTerm}%') GROUP BY e.id;`;
    return all<EventRowWithCount>(sql);
  },
};

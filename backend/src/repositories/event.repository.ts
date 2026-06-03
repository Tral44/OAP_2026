import { all, get, run, esc } from "../db/dbClient.js";

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

    let whereClause = "";
    if (params.search) {
      whereClause = `WHERE e.title LIKE '%${esc(params.search)}%'`;
    }

    const countRow = get<{ total: number }>(`SELECT COUNT(*) AS total FROM Events e ${whereClause};`);
    const total = countRow?.total ?? 0;

    const rows = all<EventRowWithCount>(`
      SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt,
             COUNT(r.id) AS registrationCount
      FROM Events e
      LEFT JOIN Registrations r ON r.eventId = e.id
      ${whereClause}
      GROUP BY e.id
      ORDER BY ${sortBy} ${sortDir}
      LIMIT ${Number(pageSize)} OFFSET ${Number(offset)};
    `);

    return { rows, total };
  },

  findById(id: number): EventRowWithCount | undefined {
    return get<EventRowWithCount>(`
      SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt,
             COUNT(r.id) AS registrationCount
      FROM Events e
      LEFT JOIN Registrations r ON r.eventId = e.id
      WHERE e.id = ${Number(id)}
      GROUP BY e.id;
    `);
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
      avgDescriptionWordCapacity: number
    }>(`
      SELECT COUNT(DISTINCT e.id) AS totalEvents,
            SUM(e.capacity) AS totalCapacity,
            COUNT(r.id) AS totalRegistrations, 
            AVG(
              CASE
                WHEN e.description IS NULL OR TRIM(e.description) = '' THEN 0
                ELSE LENGTH(TRIM(e.description)) - LENGTH(REPLACE(TRIM(e.description), ' ', '')) + 1
              END
            ) AS avgDescriptionCount
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
      VALUES ('${esc(data.title)}', '${esc(data.date)}', '${esc(data.location)}', ${Number(data.capacity)}, '${esc(data.description)}', '${now}');
    `);
    return this.findById(result.lastInsertRowid)!;
  },

  update(
    id: number,
    data: { title: string; date: string; location: string; capacity: number; description: string },
  ): EventRowWithCount | undefined {
    const result = run(`
      UPDATE Events SET title = '${esc(data.title)}', date = '${esc(data.date)}', location = '${esc(data.location)}', capacity = ${Number(data.capacity)}, description = '${esc(data.description)}'
      WHERE id = ${Number(id)};
    `);
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
    if (data.title !== undefined) sets.push(`title = '${esc(data.title)}'`);
    if (data.date !== undefined) sets.push(`date = '${esc(data.date)}'`);
    if (data.location !== undefined) sets.push(`location = '${esc(data.location)}'`);
    if (data.capacity !== undefined) sets.push(`capacity = ${Number(data.capacity)}`);
    if (data.description !== undefined) sets.push(`description = '${esc(data.description)}'`);

    if (sets.length === 0) return existing;

    run(`UPDATE Events SET ${sets.join(", ")} WHERE id = ${Number(id)};`);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = run(`DELETE FROM Events WHERE id = ${Number(id)};`);
    return result.changes > 0;
  },

  unsafeSearch(searchTerm: string): EventRowWithCount[] {
    const sql = `SELECT e.id, e.title, e.date, e.location, e.capacity, e.description, e.createdAt, COUNT(r.id) AS registrationCount FROM Events e LEFT JOIN Registrations r ON r.eventId = e.id WHERE (e.title LIKE '%${searchTerm}%' OR e.description LIKE '%${searchTerm}%') GROUP BY e.id;`;
    return all<EventRowWithCount>(sql);
  },
};

import { all, get, run } from "../db/dbClient.js";
import type { SQLInputValue } from "node:sqlite";

export interface RegistrationRow {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
}

export interface RegistrationRowWithDetails extends RegistrationRow {
  userName: string;
  userEmail: string;
  eventTitle: string;
}

export const registrationRepository = {
  findAll(params?: {
    eventId?: number;
    userId?: number;
    page?: number;
    pageSize?: number;
  }): { rows: RegistrationRowWithDetails[]; total: number } {
    const conditions: string[] = [];
    const args: SQLInputValue[] = [];
    if (params?.eventId) { conditions.push("r.eventId = ?"); args.push(params.eventId); }
    if (params?.userId) { conditions.push("r.userId = ?"); args.push(params.userId); }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const countRow = get<{ total: number }>(`SELECT COUNT(*) AS total FROM Registrations r ${whereClause};`, ...args);
    const total = countRow?.total ?? 0;

    const rows = all<RegistrationRowWithDetails>(`
      SELECT r.id, r.eventId, r.userId, r.registeredAt, u.name AS userName, u.email AS userEmail, e.title AS eventTitle
      FROM Registrations r
      JOIN Users  u ON u.id = r.userId
      JOIN Events e ON e.id = r.eventId
      ${whereClause}
      ORDER BY r.id DESC
      LIMIT ? OFFSET ?;
    `, ...args, Number(pageSize), Number(offset));

    return { rows, total };
  },

  findById(id: number): RegistrationRowWithDetails | undefined {
    return get<RegistrationRowWithDetails>(`
      SELECT r.id, r.eventId, r.userId, r.registeredAt, u.name AS userName, u.email AS userEmail, e.title AS eventTitle
      FROM Registrations r
      JOIN Users  u ON u.id = r.userId
      JOIN Events e ON e.id = r.eventId
      WHERE r.id = ?;
    `, id);
  },

  findByEventId(eventId: number): RegistrationRowWithDetails[] {
    return all<RegistrationRowWithDetails>(`
      SELECT r.id, r.eventId, r.userId, r.registeredAt, u.name AS userName, u.email AS userEmail, e.title AS eventTitle
      FROM Registrations r
      JOIN Users  u ON u.id = r.userId
      JOIN Events e ON e.id = r.eventId
      WHERE r.eventId = ?
      ORDER BY r.registeredAt ASC;
    `, eventId);
  },

  findByEventAndUser(eventId: number, userId: number): RegistrationRow | undefined {
    return get<RegistrationRow>(
      "SELECT id, eventId, userId, registeredAt FROM Registrations WHERE eventId = ? AND userId = ?;",
      eventId, userId,
    );
  },

  countByEventId(eventId: number): number {
    const row = get<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM Registrations WHERE eventId = ?;", eventId);
    return row?.cnt ?? 0;
  },

  create(eventId: number, userId: number): RegistrationRowWithDetails {
    const now = new Date().toISOString();
    const result = run(
      "INSERT INTO Registrations (eventId, userId, registeredAt) VALUES (?, ?, ?);",
      eventId, userId, now,
    );
    return this.findById(result.lastInsertRowid)!;
  },

  update(id: number, eventId: number, userId: number): RegistrationRowWithDetails | undefined {
    const result = run(
      "UPDATE Registrations SET eventId = ?, userId = ? WHERE id = ?;",
      eventId, userId, id,
    );
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },

  patch(
    id: number,
    data: { eventId?: number; userId?: number },
  ): RegistrationRowWithDetails | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const sets: string[] = [];
    const vals: SQLInputValue[] = [];
    if (data.eventId !== undefined) { sets.push("eventId = ?"); vals.push(data.eventId); }
    if (data.userId !== undefined) { sets.push("userId = ?"); vals.push(data.userId); }

    if (sets.length === 0) return existing;

    run(`UPDATE Registrations SET ${sets.join(", ")} WHERE id = ?;`, ...vals, id);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = run("DELETE FROM Registrations WHERE id = ?;", id);
    return result.changes > 0;
  },
};

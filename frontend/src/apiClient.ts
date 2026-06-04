import { API_BASE_URL } from "./config.js";
import type {
  Id,
  ApiError,
  EventDto,
  CreateEventDto,
  UserDto,
  CreateUserDto,
  RegistrationDto,
  CreateRegistrationDto,
  ListResponse,
  StatsDto,
} from "./dtos.js";

let demoUserId: number | null = 1;

export function setDemoUserId(id: number | null): void {
  demoUserId = id;
}

export function getDemoUserId(): number | null {
  return demoUserId;
}

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (demoUserId !== null) {
    headers["X-Demo-UserId"] = String(demoUserId);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (e: unknown) {
    clearTimeout(id);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw {
        status: 0,
        message: "Запит перевищив таймаут",
        details: `Час очікування: ${timeoutMs}мс`,
      } as ApiError;
    }
    throw {
      status: 0,
      message: "Помилка мережі або CORS",
      details: e instanceof Error ? e.message : String(e),
    } as ApiError;
  } finally {
    clearTimeout(id);
  }

  if (response.status === 204) {
    if (!response.ok) {
      throw { status: response.status, message: "Помилка", details: "No Content" } as ApiError;
    }
    return null as unknown as T;
  }

  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) return null as unknown as T;
    try {
      return JSON.parse(rawText) as T;
    } catch {
      return rawText as unknown as T;
    }
  }

  let payload: Record<string, unknown> | null = null;
  try { payload = rawText ? JSON.parse(rawText) : null; } catch { /* empty */ }

  const errPayload = payload?.error as Record<string, unknown> | undefined;

  throw {
    status: response.status,
    message: typeof errPayload?.message === "string" ? errPayload.message : "HTTP помилка",
    details: typeof errPayload?.details === "string"
      ? errPayload.details
      : rawText || `HTTP ${response.status}`,
    errors: Array.isArray(errPayload?.details)
      ? (errPayload.details as Array<{ field: string; message: string }>)
      : undefined,
  } as ApiError;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

export async function getEvents(params?: {
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}): Promise<ListResponse<EventDto>> {
  return request<ListResponse<EventDto>>(`/events${buildQuery(params ?? {})}`);
}

export async function getEventById(id: Id): Promise<EventDto> {
  return request<EventDto>(`/events/${id}`);
}

export async function createEvent(dto: CreateEventDto): Promise<EventDto> {
  return request<EventDto>("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateEvent(id: Id, dto: CreateEventDto): Promise<EventDto> {
  return request<EventDto>(`/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteEvent(id: Id): Promise<void> {
  await request<void>(`/events/${id}`, { method: "DELETE" });
}

export async function getStats(): Promise<StatsDto> {
  return request<StatsDto>("/events/stats");
}

export async function getUsers(params?: {
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}): Promise<ListResponse<UserDto>> {
  return request<ListResponse<UserDto>>(`/users${buildQuery(params ?? {})}`);
}

export async function getUserById(id: Id): Promise<UserDto> {
  return request<UserDto>(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<UserDto> {
  return request<UserDto>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateUser(id: Id, dto: CreateUserDto): Promise<UserDto> {
  return request<UserDto>(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteUser(id: Id): Promise<void> {
  await request<void>(`/users/${id}`, { method: "DELETE" });
}

export async function getRegistrations(params?: {
  eventId?: Id;
  userId?: Id;
  page?: number;
  pageSize?: number;
}): Promise<ListResponse<RegistrationDto>> {
  return request<ListResponse<RegistrationDto>>(`/registrations${buildQuery(params ?? {})}`);
}

export async function createRegistration(dto: CreateRegistrationDto): Promise<RegistrationDto> {
  return request<RegistrationDto>("/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteRegistration(id: Id): Promise<void> {
  await request<void>(`/registrations/${id}`, { method: "DELETE" });
}

import { eventRepository, EventRowWithCount } from "../repositories/event.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
  EventResponseDto,
  EventListResponseDto,
} from "../dtos/event.dto.js";
import { requireString, requirePositiveInt, requireISODate, collectErrors } from "../middleware/validation.js";

function toDto(row: EventRowWithCount): EventResponseDto {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    capacity: row.capacity,
    description: row.description,
    createdAt: row.createdAt,
    registrationCount: row.registrationCount ?? 0,
  };
}

export const eventService = {
  async getAll(params: {
    search?: string;
    sortBy?: string;
    sortDir?: string;
    page?: number;
    pageSize?: number;
  }): Promise<EventListResponseDto> {
    const { rows, total } = eventRepository.findAll(params);
    return { items: rows.map(toDto), total };
  },

  async getById(id: number): Promise<EventResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const event = eventRepository.findById(id);
    if (!event) throw ApiError.notFound(`Event with id ${id} not found`);
    return toDto(event);
  },

  async create(dto: CreateEventRequestDto): Promise<EventResponseDto> {
    const errors = collectErrors(
      requireString(dto.title, "title", 2),
      requireISODate(dto.date, "date"),
      requireString(dto.location, "location", 2),
      requirePositiveInt(dto.capacity, "capacity"),
      requireString(dto.description, "description"),
    );
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const created = eventRepository.create({
      title: dto.title.trim(),
      date: dto.date,
      location: dto.location.trim(),
      capacity: Number(dto.capacity),
      description: dto.description.trim(),
    });
    return toDto(created);
  },

  async update(id: number, dto: UpdateEventRequestDto): Promise<EventResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!eventRepository.findById(id)) throw ApiError.notFound(`Event with id ${id} not found`);

    const errors = collectErrors(
      requireString(dto.title, "title", 2),
      requireISODate(dto.date, "date"),
      requireString(dto.location, "location", 2),
      requirePositiveInt(dto.capacity, "capacity"),
      requireString(dto.description, "description"),
    );
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const updated = eventRepository.update(id, {
      title: dto.title.trim(),
      date: dto.date,
      location: dto.location.trim(),
      capacity: Number(dto.capacity),
      description: dto.description.trim(),
    });
    return toDto(updated!);
  },

  async patch(id: number, dto: Partial<UpdateEventRequestDto>): Promise<EventResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!eventRepository.findById(id)) throw ApiError.notFound(`Event with id ${id} not found`);
    const updated = eventRepository.patch(id, dto);
    return toDto(updated!);
  },

  async delete(id: number): Promise<void> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const ok = eventRepository.delete(id);
    if (!ok) throw ApiError.notFound(`Event with id ${id} not found`);
  },

  async getStats() {
    return eventRepository.getStats();
  },

  async unsafeSearch(searchTerm: string): Promise<EventResponseDto[]> {
    const rows = eventRepository.unsafeSearch(searchTerm);
    return rows.map(toDto);
  },
};

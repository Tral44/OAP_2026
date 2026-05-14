import { eventRepository, EventQueryParams } from "../repositories/event.repository.js";
import { registrationRepository } from "../repositories/registration.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
  EventResponseDto,
  EventListResponseDto,
} from "../dtos/event.dto.js";
import {
  requireString,
  requirePositiveInt,
  requireISODate,
  collectErrors,
} from "../middleware/validation.js";

function toResponseDto(entity: {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}): EventResponseDto {
  return {
    id: entity.id,
    title: entity.title,
    date: entity.date,
    location: entity.location,
    capacity: entity.capacity,
    description: entity.description,
    registrationCount: registrationRepository.countByEventId(entity.id),
  };
}

export const eventService = {
  getAll(params: EventQueryParams): EventListResponseDto {
    const { items, total } = eventRepository.findAll(params);
    return {
      items: items.map(toResponseDto),
      total,
    };
  },

  getById(id: string): EventResponseDto {
    const event = eventRepository.findById(id);
    if (!event) throw ApiError.notFound(`Event with id "${id}" not found`);
    return toResponseDto(event);
  },

  create(dto: CreateEventRequestDto): EventResponseDto {
    const errors = collectErrors(
      requireString(dto.title, "title", 2),
      requireISODate(dto.date, "date"),
      requireString(dto.location, "location", 2),
      requirePositiveInt(dto.capacity, "capacity"),
      requireString(dto.description, "description"),
    );

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const created = eventRepository.create({
      title: dto.title.trim(),
      date: dto.date,
      location: dto.location.trim(),
      capacity: Number(dto.capacity),
      description: dto.description.trim(),
    });

    return toResponseDto(created);
  },

  update(id: string, dto: UpdateEventRequestDto): EventResponseDto {
    if (!eventRepository.findById(id)) {
      throw ApiError.notFound(`Event with id "${id}" not found`);
    }

    const errors = collectErrors(
      requireString(dto.title, "title", 2),
      requireISODate(dto.date, "date"),
      requireString(dto.location, "location", 2),
      requirePositiveInt(dto.capacity, "capacity"),
      requireString(dto.description, "description"),
    );

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const updated = eventRepository.update(id, {
      title: dto.title.trim(),
      date: dto.date,
      location: dto.location.trim(),
      capacity: Number(dto.capacity),
      description: dto.description.trim(),
    });

    return toResponseDto(updated!);
  },

  patch(id: string, dto: Partial<UpdateEventRequestDto>): EventResponseDto {
    const existing = eventRepository.findById(id);
    if (!existing) throw ApiError.notFound(`Event with id "${id}" not found`);

    const errors = collectErrors(
      dto.title !== undefined ? requireString(dto.title, "title", 2) : null,
      dto.date !== undefined ? requireISODate(dto.date, "date") : null,
      dto.location !== undefined ? requireString(dto.location, "location", 2) : null,
      dto.capacity !== undefined ? requirePositiveInt(dto.capacity, "capacity") : null,
      dto.description !== undefined ? requireString(dto.description, "description") : null,
    );

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const updated = eventRepository.update(id, {
      title: dto.title?.trim() ?? existing.title,
      date: dto.date ?? existing.date,
      location: dto.location?.trim() ?? existing.location,
      capacity: dto.capacity !== undefined ? Number(dto.capacity) : existing.capacity,
      description: dto.description?.trim() ?? existing.description,
    });

    return toResponseDto(updated!);
  },

  delete(id: string): void {
    if (!eventRepository.findById(id)) {
      throw ApiError.notFound(`Event with id "${id}" not found`);
    }
    registrationRepository.deleteByEventId(id);
    eventRepository.delete(id);
  },
};

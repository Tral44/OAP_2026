import { registrationRepository } from "../repositories/registration.repository.js";
import { eventRepository } from "../repositories/event.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateRegistrationRequestDto,
  RegistrationResponseDto,
  RegistrationListResponseDto,
} from "../dtos/registration.dto.js";
import { requireString, collectErrors } from "../middleware/validation.js";

function toResponseDto(entity: {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}): RegistrationResponseDto {
  return {
    id: entity.id,
    eventId: entity.eventId,
    userId: entity.userId,
    registeredAt: entity.registeredAt,
  };
}

export const registrationService = {
  getAll(): RegistrationListResponseDto {
    const regs = registrationRepository.findAll();
    return {
      items: regs.map(toResponseDto),
      total: regs.length,
    };
  },

  getById(id: string): RegistrationResponseDto {
    const reg = registrationRepository.findById(id);
    if (!reg) throw ApiError.notFound(`Registration with id "${id}" not found`);
    return toResponseDto(reg);
  },

  getByEvent(eventId: string): RegistrationListResponseDto {
    if (!eventRepository.findById(eventId)) {
      throw ApiError.notFound(`Event with id "${eventId}" not found`);
    }
    const regs = registrationRepository.findByEventId(eventId);
    return {
      items: regs.map(toResponseDto),
      total: regs.length,
    };
  },

  create(dto: CreateRegistrationRequestDto): RegistrationResponseDto {
    const errors = collectErrors(
      requireString(dto.eventId, "eventId"),
      requireString(dto.userId, "userId"),
    );

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const event = eventRepository.findById(dto.eventId);
    if (!event) {
      throw ApiError.notFound(`Event with id "${dto.eventId}" not found`);
    }

    if (!userRepository.findById(dto.userId)) {
      throw ApiError.notFound(`User with id "${dto.userId}" not found`);
    }

    const existing = registrationRepository.findByEventAndUser(dto.eventId, dto.userId);
    if (existing) {
      throw ApiError.conflict("User is already registered for this event");
    }

    const currentCount = registrationRepository.countByEventId(dto.eventId);
    if (currentCount >= event.capacity) {
      throw ApiError.conflict("Event is full (no more capacity)");
    }

    const created = registrationRepository.create({
      eventId: dto.eventId,
      userId: dto.userId,
    });

    return toResponseDto(created);
  },

  delete(id: string): void {
    if (!registrationRepository.findById(id)) {
      throw ApiError.notFound(`Registration with id "${id}" not found`);
    }
    registrationRepository.delete(id);
  },
};

import { registrationRepository, RegistrationRowWithDetails } from "../repositories/registration.repository.js";
import { eventRepository } from "../repositories/event.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateRegistrationRequestDto,
  UpdateRegistrationRequestDto,
  RegistrationResponseDto,
  RegistrationListResponseDto,
} from "../dtos/registration.dto.js";
import { requirePositiveInt, collectErrors } from "../middleware/validation.js";

function toDto(row: RegistrationRowWithDetails): RegistrationResponseDto {
  return {
    id: row.id,
    eventId: row.eventId,
    userId: row.userId,
    registeredAt: row.registeredAt,
    userName: row.userName,
    userEmail: row.userEmail,
    eventTitle: row.eventTitle,
  };
}

export const registrationService = {
  async getAll(params?: {
    eventId?: number;
    userId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<RegistrationListResponseDto> {
    const { rows, total } = registrationRepository.findAll(params);
    return { items: rows.map(toDto), total };
  },

  async getById(id: number): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const reg = registrationRepository.findById(id);
    if (!reg) throw ApiError.notFound(`Registration with id ${id} not found`);
    return toDto(reg);
  },

  async getByEvent(eventId: number): Promise<RegistrationListResponseDto> {
    if (!Number.isFinite(eventId)) throw ApiError.validationError("Invalid eventId", []);
    if (!eventRepository.findById(eventId)) throw ApiError.notFound(`Event with id ${eventId} not found`);
    const rows = registrationRepository.findByEventId(eventId);
    return { items: rows.map(toDto), total: rows.length };
  },

  async create(dto: CreateRegistrationRequestDto): Promise<RegistrationResponseDto> {
    const errors = collectErrors(requirePositiveInt(dto.eventId, "eventId"), requirePositiveInt(dto.userId, "userId"));
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const event = eventRepository.findById(dto.eventId);
    if (!event) throw ApiError.notFound(`Event with id ${dto.eventId} not found`);

    const user = userRepository.findById(dto.userId);
    if (!user) throw ApiError.notFound(`User with id ${dto.userId} not found`);

    const existing = registrationRepository.findByEventAndUser(dto.eventId, dto.userId);
    if (existing) throw ApiError.conflict("User is already registered for this event");

    const currentCount = registrationRepository.countByEventId(dto.eventId);
    if (currentCount >= event.capacity) throw ApiError.conflict("Event is full (no more capacity)");

    const created = registrationRepository.create(dto.eventId, dto.userId);
    return toDto(created);
  },

  async update(id: number, dto: UpdateRegistrationRequestDto): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!registrationRepository.findById(id)) throw ApiError.notFound(`Registration with id ${id} not found`);
    const event = eventRepository.findById(dto.eventId);
    if (!event) throw ApiError.notFound(`Event with id ${dto.eventId} not found`);
    const user = userRepository.findById(dto.userId);
    if (!user) throw ApiError.notFound(`User with id ${dto.userId} not found`);
    const updated = registrationRepository.update(id, dto.eventId, dto.userId);
    return toDto(updated!);
  },

  async patch(id: number, dto: Partial<UpdateRegistrationRequestDto>): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!registrationRepository.findById(id)) throw ApiError.notFound(`Registration with id ${id} not found`);
    const updated = registrationRepository.patch(id, dto);
    return toDto(updated!);
  },

  async delete(id: number): Promise<void> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const ok = registrationRepository.delete(id);
    if (!ok) throw ApiError.notFound(`Registration with id ${id} not found`);
  },
};

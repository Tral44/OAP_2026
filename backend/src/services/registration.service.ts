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
  async getAll(currentUserId: number, params?: {
    eventId?: number;
    userId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<RegistrationListResponseDto> {
    const { rows, total } = registrationRepository.findAll({
      ...params,
      userId: currentUserId,
    });
    return { items: rows.map(toDto), total };
  },

  async getById(id: number, currentUserId: number): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const reg = registrationRepository.findById(id);
    if (!reg || reg.userId !== currentUserId) throw ApiError.notFound(`Registration with id ${id} not found`);
    return toDto(reg);
  },

  async getByEvent(eventId: number, currentUserId: number): Promise<RegistrationListResponseDto> {
    if (!Number.isFinite(eventId)) throw ApiError.validationError("Invalid eventId", []);
    if (!eventRepository.findById(eventId)) throw ApiError.notFound(`Event with id ${eventId} not found`);
    const rows = registrationRepository.findByEventId(eventId);
    const filtered = rows.filter((r) => r.userId === currentUserId);
    return { items: filtered.map(toDto), total: filtered.length };
  },

  async create(dto: CreateRegistrationRequestDto, currentUserId: number): Promise<RegistrationResponseDto> {
    const errors = collectErrors(requirePositiveInt(dto.eventId, "eventId"));
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const event = eventRepository.findById(dto.eventId);
    if (!event) throw ApiError.notFound(`Event with id ${dto.eventId} not found`);

    const user = userRepository.findById(currentUserId);
    if (!user) throw ApiError.notFound(`User with id ${currentUserId} not found`);

    const existing = registrationRepository.findByEventAndUser(dto.eventId, currentUserId);
    if (existing) throw ApiError.conflict("User is already registered for this event");

    const currentCount = registrationRepository.countByEventId(dto.eventId);
    if (currentCount >= event.capacity) throw ApiError.conflict("Event is full (no more capacity)");

    const created = registrationRepository.create(dto.eventId, currentUserId);
    return toDto(created);
  },

  async update(id: number, dto: UpdateRegistrationRequestDto, currentUserId: number): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const existing = registrationRepository.findById(id);
    if (!existing || existing.userId !== currentUserId) throw ApiError.notFound(`Registration with id ${id} not found`);
    const event = eventRepository.findById(dto.eventId);
    if (!event) throw ApiError.notFound(`Event with id ${dto.eventId} not found`);
    const user = userRepository.findById(currentUserId);
    if (!user) throw ApiError.notFound(`User with id ${currentUserId} not found`);
    const updated = registrationRepository.update(id, dto.eventId, currentUserId);
    return toDto(updated!);
  },

  async patch(id: number, dto: Partial<UpdateRegistrationRequestDto>, currentUserId: number): Promise<RegistrationResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const existing = registrationRepository.findById(id);
    if (!existing || existing.userId !== currentUserId) throw ApiError.notFound(`Registration with id ${id} not found`);
    const { userId: _ignored, ...safeDto } = dto;
    const updated = registrationRepository.patch(id, safeDto);
    return toDto(updated!);
  },

  async delete(id: number, currentUserId: number): Promise<void> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const existing = registrationRepository.findById(id);
    if (!existing || existing.userId !== currentUserId) throw ApiError.notFound(`Registration with id ${id} not found`);
    const ok = registrationRepository.delete(id);
    if (!ok) throw ApiError.notFound(`Registration with id ${id} not found`);
  },
};

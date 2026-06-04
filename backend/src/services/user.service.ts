import { userRepository, UserRow } from "../repositories/user.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
  UserListResponseDto,
} from "../dtos/user.dto.js";
import { requireString, isValidEmail, collectErrors } from "../middleware/validation.js";

function toDto(row: UserRow): UserResponseDto {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt };
}

export const userService = {
  async getAll(params: {
    sortBy?: string;
    sortDir?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<UserListResponseDto> {
    const { rows, total } = userRepository.findAll(params);
    return { items: rows.map(toDto), total };
  },

  async getById(id: number): Promise<UserResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const user = userRepository.findById(id);
    if (!user) throw ApiError.notFound(`User with id ${id} not found`);
    return toDto(user);
  },

  async create(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const errors = collectErrors(requireString(dto.name, "name", 2), requireString(dto.email, "email", 5));
    if (dto.email && !isValidEmail(dto.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const existing = userRepository.findByEmail(dto.email.toLowerCase());
    if (existing) throw ApiError.conflict(`User with email "${dto.email}" already exists`);

    const created = userRepository.create(dto.name.trim(), dto.email.toLowerCase().trim());
    return toDto(created);
  },

  async update(id: number, dto: UpdateUserRequestDto): Promise<UserResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!userRepository.findById(id)) throw ApiError.notFound(`User with id ${id} not found`);

    const errors = collectErrors(requireString(dto.name, "name", 2), requireString(dto.email, "email", 5));
    if (dto.email && !isValidEmail(dto.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }
    if (errors.length > 0) throw ApiError.validationError("Invalid request body", errors);

    const emailOwner = userRepository.findByEmail(dto.email.toLowerCase());
    if (emailOwner && emailOwner.id !== id) throw ApiError.conflict(`Email "${dto.email}" is already taken`);

    const updated = userRepository.update(id, dto.name.trim(), dto.email.toLowerCase().trim());
    return toDto(updated!);
  },

  async patch(id: number, dto: Partial<UpdateUserRequestDto>): Promise<UserResponseDto> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    if (!userRepository.findById(id)) throw ApiError.notFound(`User with id ${id} not found`);

    if (dto.email !== undefined) {
      if (!isValidEmail(dto.email)) {
        throw ApiError.validationError("Invalid request body", [{ field: "email", message: "Invalid email format" }]);
      }
      const emailOwner = userRepository.findByEmail(dto.email.toLowerCase());
      if (emailOwner && emailOwner.id !== id) throw ApiError.conflict(`Email "${dto.email}" is already taken`);
    }

    const updated = userRepository.patch(id, {
      name: dto.name?.trim(),
      email: dto.email?.toLowerCase().trim(),
    });
    return toDto(updated!);
  },

  async delete(id: number): Promise<void> {
    if (!Number.isFinite(id)) throw ApiError.validationError("Invalid id", []);
    const ok = userRepository.delete(id);
    if (!ok) throw ApiError.notFound(`User with id ${id} not found`);
  },
};

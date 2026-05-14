import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../middleware/api-error.js";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
  UserListResponseDto,
} from "../dtos/user.dto.js";
import { requireString, collectErrors } from "../middleware/validation.js";

function toResponseDto(entity: {
  id: string;
  name: string;
  email: string;
}): UserResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const userService = {
  getAll(): UserListResponseDto {
    const users = userRepository.findAll();
    return {
      items: users.map(toResponseDto),
      total: users.length,
    };
  },

  getById(id: string): UserResponseDto {
    const user = userRepository.findById(id);
    if (!user) throw ApiError.notFound(`User with id "${id}" not found`);
    return toResponseDto(user);
  },

  create(dto: CreateUserRequestDto): UserResponseDto {
    const errors = collectErrors(
      requireString(dto.name, "name", 2),
      requireString(dto.email, "email", 5),
    );

    if (!errors.some((e) => e.field === "email") && !isValidEmail(dto.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const existing = userRepository.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw ApiError.conflict(`User with email "${dto.email}" already exists`);
    }

    const created = userRepository.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
    });

    return toResponseDto(created);
  },

  update(id: string, dto: UpdateUserRequestDto): UserResponseDto {
    if (!userRepository.findById(id)) {
      throw ApiError.notFound(`User with id "${id}" not found`);
    }

    const errors = collectErrors(
      requireString(dto.name, "name", 2),
      requireString(dto.email, "email", 5),
    );

    if (!errors.some((e) => e.field === "email") && !isValidEmail(dto.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (errors.length > 0) {
      throw ApiError.validationError("Invalid request body", errors);
    }

    const emailOwner = userRepository.findByEmail(dto.email.toLowerCase());
    if (emailOwner && emailOwner.id !== id) {
      throw ApiError.conflict(`Email "${dto.email}" is already taken`);
    }

    const updated = userRepository.update(id, {
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
    });

    return toResponseDto(updated!);
  },

  delete(id: string): void {
    if (!userRepository.findById(id)) {
      throw ApiError.notFound(`User with id "${id}" not found`);
    }
    userRepository.delete(id);
  },
};

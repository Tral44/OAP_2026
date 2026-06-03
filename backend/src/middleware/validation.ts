import { ErrorDetail } from "./api-error.js";

export function requireString(value: unknown, fieldName: string, minLen = 1): ErrorDetail | null {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a non-empty string (min ${minLen} chars)`,
    };
  }
  return null;
}

export function requirePositiveInt(value: unknown, fieldName: string): ErrorDetail | null {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a positive integer`,
    };
  }
  return null;
}

export function requireISODate(value: unknown, fieldName: string): ErrorDetail | null {
  if (typeof value !== "string") {
    return { field: fieldName, message: `"${fieldName}" must be a string` };
  }
  const parsed = Date.parse(value);
  if (isNaN(parsed)) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a valid ISO date string`,
    };
  }
  return null;
}

export function collectErrors(...checks: (ErrorDetail | null)[]): ErrorDetail[] {
  return checks.filter((e): e is ErrorDetail => e !== null);
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return emailRe.test(email);
}

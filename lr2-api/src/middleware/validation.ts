import { ErrorDetail } from "./api-error.js";

export function requireString(
  value: unknown,
  fieldName: string,
  minLen = 1,
): ErrorDetail | null {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a non-empty string (min ${minLen} chars)`,
    };
  }
  return null;
}

export function requirePositiveInt(
  value: unknown,
  fieldName: string,
): ErrorDetail | null {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a positive integer`,
    };
  }
  return null;
}

export function requireISODate(
  value: unknown,
  fieldName: string,
): ErrorDetail | null {
  if (typeof value !== "string") {
    return { field: fieldName, message: `"${fieldName}" must be a string` };
  }
  const iso = Date.parse(value);
  if (isNaN(iso)) {
    return {
      field: fieldName,
      message: `"${fieldName}" must be a valid ISO date string (e.g. "2026-09-01")`,
    };
  }
  return null;
}

export function collectErrors(
  ...checks: (ErrorDetail | null)[]
): ErrorDetail[] {
  return checks.filter((e): e is ErrorDetail => e !== null);
}

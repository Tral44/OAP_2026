import { Request, Response, NextFunction } from "express";
import { ApiError } from "./api-error.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  const msg = String(err instanceof Error ? err.message : err);

  if (msg.includes("SQLITE_CONSTRAINT_UNIQUE")) {
    res.status(409).json({
      error: { code: "CONFLICT", message: "Resource already exists", details: null },
    });
    return;
  }

  if (msg.includes("SQLITE_CONSTRAINT_NOTNULL")) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "A required field is missing", details: null },
    });
    return;
  }

  if (msg.includes("SQLITE_CONSTRAINT_FOREIGNKEY")) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Referenced record does not exist", details: null },
    });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred", details: null },
  });
}

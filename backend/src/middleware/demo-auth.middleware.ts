import { Request, Response, NextFunction } from "express";
import { ApiError } from "./api-error.js";
import { userRepository } from "../repositories/user.repository.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

export function demoAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("X-Demo-UserId");
  if (!header) {
    return next(ApiError.unauthorized("Missing X-Demo-UserId header"));
  }

  const userId = Number(header);
  if (!Number.isInteger(userId) || userId < 1) {
    return next(ApiError.unauthorized("Invalid X-Demo-UserId format"));
  }

  const user = userRepository.findById(userId);
  if (!user) {
    return next(ApiError.unauthorized("User not found"));
  }

  req.user = { id: userId };
  next();
}

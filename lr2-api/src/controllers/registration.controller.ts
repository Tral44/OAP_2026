import { Request, Response, NextFunction } from "express";
import { registrationService } from "../services/registration.service.js";
import { CreateRegistrationRequestDto } from "../dtos/registration.dto.js";

export const registrationController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = registrationService.getAll();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = registrationService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getByEvent(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = registrationService.getByEvent(req.params.eventId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as CreateRegistrationRequestDto;
      const result = registrationService.create(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      registrationService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

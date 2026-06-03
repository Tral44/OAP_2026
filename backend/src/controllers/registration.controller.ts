import { Request, Response, NextFunction } from "express";
import { registrationService } from "../services/registration.service.js";

export const registrationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params: { eventId?: number; userId?: number; page?: number; pageSize?: number } = {};
      if (req.query.eventId) params.eventId = Number(req.query.eventId);
      if (req.query.userId) params.userId = Number(req.query.userId);
      params.page = req.query.page ? Number(req.query.page) : 1;
      params.pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
      res.status(200).json(await registrationService.getAll(params));
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await registrationService.getById(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  },

  async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await registrationService.getByEvent(Number(req.params.eventId)));
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await registrationService.create(req.body));
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await registrationService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await registrationService.patch(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await registrationService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/event.service.js";

export const eventController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.getAll({
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortDir: req.query.sortDir as string,
        page: req.query.page ? Number(req.query.page) : 1,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
      });
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await eventService.getById(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await eventService.getStats());
    } catch (e) {
      next(e);
    }
  },

  async unsafeSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.unsafeSearch((req.query.q as string) ?? "");
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await eventService.create(req.body));
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await eventService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await eventService.patch(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await eventService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};

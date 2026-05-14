import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/event.service.js";
import { CreateEventRequestDto, UpdateEventRequestDto } from "../dtos/event.dto.js";

export const eventController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

      const result = eventService.getAll({
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortDir: req.query.sortDir as "asc" | "desc" | undefined,
        page,
        pageSize,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = eventService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as CreateEventRequestDto;
      const result = eventService.create(dto);

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as UpdateEventRequestDto;
      const result = eventService.update(req.params.id, dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  patch(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as Partial<UpdateEventRequestDto>;
      const result = eventService.patch(req.params.id, dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      eventService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

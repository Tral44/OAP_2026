import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { CreateUserRequestDto, UpdateUserRequestDto } from "../dtos/user.dto.js";

export const userController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = userService.getAll();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = userService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as CreateUserRequestDto;
      const result = userService.create(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = req.body as UpdateUserRequestDto;
      const result = userService.update(req.params.id, dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      userService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

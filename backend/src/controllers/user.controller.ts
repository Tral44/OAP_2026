import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAll({
        sortBy: req.query.sortBy as string,
        sortDir: req.query.sortDir as string,
        search: req.query.search as string,
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
      res.status(200).json(await userService.getById(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await userService.create(req.body));
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await userService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await userService.patch(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};

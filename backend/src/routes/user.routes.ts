import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/", userController.getAll);
userRouter.post("/", userController.create);
userRouter.get("/:id", userController.getById);
userRouter.put("/:id", userController.update);
userRouter.patch("/:id", userController.patch);
userRouter.delete("/:id", userController.delete);

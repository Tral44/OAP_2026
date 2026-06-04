import { Router } from "express";
import { registrationController } from "../controllers/registration.controller.js";

export const registrationRouter = Router();

registrationRouter.get("/", registrationController.getAll);
registrationRouter.post("/", registrationController.create);
registrationRouter.get("/:id", registrationController.getById);
registrationRouter.put("/:id", registrationController.update);
registrationRouter.patch("/:id", registrationController.patch);
registrationRouter.delete("/:id", registrationController.delete);

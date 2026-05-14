import { Router } from "express";
import { registrationController } from "../controllers/registration.controller.js";

const registrationRouter = Router();

registrationRouter.get("/", registrationController.getAll);
registrationRouter.post("/", registrationController.create);
registrationRouter.get("/:id", registrationController.getById);
registrationRouter.delete("/:id", registrationController.delete);

export { registrationRouter };

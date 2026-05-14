import { Router } from "express";
import { eventController } from "../controllers/event.controller.js";
import { registrationController } from "../controllers/registration.controller.js";


const eventRouter = Router();

eventRouter.get("/", eventController.getAll);
eventRouter.post("/", eventController.create);
eventRouter.get("/:eventId/registrations", registrationController.getByEvent);
eventRouter.get("/:id", eventController.getById);
eventRouter.put("/:id", eventController.update);
eventRouter.patch("/:id", eventController.patch);
eventRouter.delete("/:id", eventController.delete);

export { eventRouter };

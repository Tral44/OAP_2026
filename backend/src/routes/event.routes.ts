import { Router } from "express";
import { eventController } from "../controllers/event.controller.js";

export const eventRouter = Router();

eventRouter.get("/stats", eventController.getStats);
eventRouter.get("/unsafe-search", eventController.unsafeSearch);
eventRouter.get("/", eventController.getAll);
eventRouter.post("/", eventController.create);
eventRouter.get("/:id", eventController.getById);
eventRouter.put("/:id", eventController.update);
eventRouter.patch("/:id", eventController.patch);
eventRouter.delete("/:id", eventController.delete);

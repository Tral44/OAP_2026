import express from "express";
import { migrate } from "./db/migrate.js";
import { requestLogger } from "./middleware/request-logging.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", details: null },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function bootstrap(): Promise<void> {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    console.log(`  Health:        GET /health`);
    console.log(`  Users:         GET /api/users`);
    console.log(`  Events:        GET /api/events`);
    console.log(`  Registrations: GET /api/registrations`);
    console.log(`  Stats:         GET /api/events/stats`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

import express from "express";
import { requestLogger } from "./middleware/request-logging.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { eventRouter } from "./routes/event.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/events", eventRouter);
app.use("/api/users", userRouter);
app.use("/api/registrations", registrationRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      details: null,
    },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Events: http://localhost:${PORT}/api/events`);
  console.log(`   Users:  http://localhost:${PORT}/api/users`);
  console.log(`   Registrations: http://localhost:${PORT}/api/registrations`);
});

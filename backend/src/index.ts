import express from "express";
import cors from "cors";
import { migrate } from "./db/migrate.js";
import { requestLogger } from "./middleware/request-logging.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { registrationRouter } from "./routes/registration.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (/^https?:\/\/[^/]+:5500$/.test(origin)) return cb(null, true);
    return cb(new Error("CORS: origin is not allowed"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
  } else {
    next();
  }
});

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/registrations", registrationRouter);

app.use((req, res) => {
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
    console.log(`  Users:         GET /api/v1/users`);
    console.log(`  Events:        GET /api/v1/events`);
    console.log(`  Registrations: GET /api/v1/registrations`);
    console.log(`  Stats:         GET /api/v1/events/stats`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

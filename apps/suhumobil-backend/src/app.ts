import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/error-handler";
import { generalRateLimiter } from "./middleware/rate-limiter";
import { failure } from "./utils/response";

import authRoutes from "./modules/auth/auth.routes";
import carsRoutes from "./modules/cars/cars.routes";
import leadsRoutes from "./modules/leads/leads.routes";
import articlesRoutes from "./modules/articles/articles.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import curatorsRoutes from "./modules/curators/curators.routes";
import trackingRoutes from "./modules/tracking/tracking.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// General rate limit applied to everything; specific stricter limits are
// layered on top for /auth/login and /leads inside their own route modules.
app.use(generalRateLimiter);

const API_PREFIX = "/api/v1";
app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, carsRoutes);
app.use(API_PREFIX, leadsRoutes);
app.use(API_PREFIX, articlesRoutes);
app.use(API_PREFIX, settingsRoutes);
app.use(API_PREFIX, dashboardRoutes);
app.use(API_PREFIX, curatorsRoutes);
app.use(API_PREFIX, trackingRoutes);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use((_req, res) => {
  res.status(404).json(failure("Not Found", { code: "NOT_FOUND" }));
});

// Must be registered last.
app.use(errorHandler);

export default app;

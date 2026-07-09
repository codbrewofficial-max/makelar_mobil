import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  redact: {
    paths: ["password", "passwordHash", "token", "req.headers.cookie", "req.headers.authorization"],
    remove: true,
  },
  transport: env.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true },
      },
});

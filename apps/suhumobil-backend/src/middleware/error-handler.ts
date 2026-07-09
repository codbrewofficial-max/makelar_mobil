import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../types";
import { failure } from "../utils/response";
import { logger } from "../lib/logger";

/**
 * Global error handler - must be registered last in app.ts.
 * Never leaks stack traces to the client (00-development-rules.md section 14).
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, "AppError (5xx)");
    }
    return res.status(err.statusCode).json(
      failure(err.message, { code: err.code, ...(err.fieldErrors ?? {}) })
    );
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".") || "_";
      fieldErrors[path] = issue.message;
    }
    return res.status(422).json(failure("Validation Error", fieldErrors));
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json(failure("Internal Server Error", { code: "INTERNAL_ERROR" }));
}

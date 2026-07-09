import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { failure } from "../utils/response";

function formatZodErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    fieldErrors[path] = issue.message;
  }
  return fieldErrors;
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json(failure("Validation Error", formatZodErrors(result.error)));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(422).json(failure("Validation Error", formatZodErrors(result.error)));
    }
    // Express 5 makes req.query a getter-only property; store parsed query separately.
    (req as any).validatedQuery = result.data;
    next();
  };
}

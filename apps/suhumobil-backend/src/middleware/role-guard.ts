import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { failure } from "../utils/response";

/**
 * Middleware factory restricting access to specific roles.
 * Not used anywhere in MVP yet, prepared for future OWNER-only endpoints.
 */
export function roleGuard(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json(failure("Forbidden", { role: "Role tidak diizinkan" }));
    }
    next();
  };
}

import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../lib/jwt";
import { failure } from "../utils/response";
import { prisma } from "../lib/prisma";

/**
 * Reads JWT from the HttpOnly cookie, verifies it, and attaches req.user.
 * Responds 401 if missing/invalid/expired, or if the user was soft-deleted.
 */
export async function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json(failure("Unauthorized", { auth: "Token tidak ditemukan" }));
    }

    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.deletedAt) {
      return res.status(401).json(failure("Unauthorized", { auth: "User tidak valid" }));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json(failure("Unauthorized", { auth: "Token tidak valid atau kedaluwarsa" }));
  }
}

import type { Request } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "EXPORT";

export type AuditEntity =
  | "car"
  | "car_image"
  | "curator"
  | "article"
  | "lead"
  | "settings"
  | "content_section"
  | "media_asset"
  | "database"
  | "auth";

interface WriteAuditLogInput {
  userId?: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  req?: Request;
}

function getIpAddress(req?: Request): string | null {
  if (!req) return null;
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? null;
}

/**
 * Persist an audit trail entry to the database (audit_logs table).
 * This is ADDITIVE to the existing Pino `logger.info({ action })` calls
 * already present across services — it does NOT replace them.
 * Never throws: audit logging must never break the main request flow.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? (input.metadata as any) : undefined,
        ipAddress: getIpAddress(input.req),
      },
    });
  } catch (err) {
    // Audit logging failures must never break the main request flow.
    logger.error({ err, input }, "Failed to write audit log");
  }
}

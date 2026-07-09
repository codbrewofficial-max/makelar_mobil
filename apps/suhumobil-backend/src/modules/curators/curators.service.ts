import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { processImage } from "../../utils/image-processor";
import { uploadToR2, deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import { randomUUID } from "node:crypto";
import type { CreateCuratorInput, UpdateCuratorInput, ListCuratorsQuery } from "./curators.schema";

/**
 * Curator is a public content entity (team profile), NOT a login role.
 * No soft delete — deletes are always hard (per 07-addendum Section 5 / 08-instruksi Section 1).
 */
export async function listCurators(query: ListCuratorsQuery) {
  const where: any = {};
  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }
  // Not paginated - curator count is small (KISS, per addendum Section 5).
  return prisma.curator.findMany({ where, orderBy: { createdAt: "asc" } });
}

export async function getCuratorById(id: string) {
  const curator = await prisma.curator.findUnique({ where: { id } });
  if (!curator) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");
  return curator;
}

export async function createCurator(input: CreateCuratorInput, userId: string) {
  const curator = await prisma.curator.create({
    data: {
      name: input.name,
      role: input.role || "Kurator Utama",
      description: input.description,
      photoUrl: null,
    },
  });
  logger.info({ action: "CURATOR_CREATED", userId, curatorId: curator.id });
  return curator;
}

export async function updateCurator(id: string, input: UpdateCuratorInput, userId: string) {
  const existing = await prisma.curator.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");

  const curator = await prisma.curator.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });

  logger.info({ action: "CURATOR_UPDATED", userId, curatorId: id });
  return curator;
}

export async function uploadCuratorPhoto(id: string, fileBuffer: Buffer, userId: string) {
  const existing = await prisma.curator.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");

  const processed = await processImage(fileBuffer, 512, 512, 500);
  const key = `curators/${randomUUID()}.webp`;
  const url = await uploadToR2(key, processed.buffer, "image/webp");

  // Delete old photo from R2 first to avoid orphan files (00-development-rules.md section 28).
  if (existing.photoUrl) {
    await deleteFromR2(existing.photoUrl).catch((err) =>
      logger.error({ err }, "Failed to delete old curator photo from R2")
    );
  }

  const curator = await prisma.curator.update({ where: { id }, data: { photoUrl: url } });
  logger.info({ action: "CURATOR_PHOTO_UPLOADED", userId, curatorId: id });
  return curator;
}

export async function deleteCurator(id: string, userId: string) {
  const curator = await prisma.curator.findUnique({ where: { id } });
  if (!curator) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");

  // Delete R2 file FIRST; if it fails, abort and let the admin retry (same pattern as cars).
  if (curator.photoUrl) {
    await deleteFromR2(curator.photoUrl);
  }

  await prisma.curator.delete({ where: { id } });
  logger.info({ action: "CURATOR_DELETED", userId, curatorId: id });
}

import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { processImage } from "../../utils/image-processor";
import { hashBuffer } from "../../utils/file-hash";
import { uploadToR2, deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import { writeAuditLog } from "../../utils/audit-log";
import type { ListMediaQuery, CreateMediaLinkInput } from "./media.schema";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function listMedia(query: ListMediaQuery) {
  const { page, limit, sourceType } = query;
  const where: any = {};
  if (sourceType) where.sourceType = sourceType;

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function uploadMedia(file: Express.Multer.File, userId: string) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(422, "VALIDATION_ERROR", "Tipe file tidak didukung", {
      file: "Hanya JPG, PNG, atau WebP yang diperbolehkan",
    });
  }

  const processed = await processImage(file.buffer, 1920, 1080, 500);
  const fileHash = hashBuffer(processed.buffer);
  const key = `media/${randomUUID()}.webp`;
  const url = await uploadToR2(key, processed.buffer, "image/webp");

  const asset = await prisma.mediaAsset.create({
    data: {
      url,
      sourceType: "UPLOAD",
      fileHash,
      sizeBytes: processed.buffer.byteLength,
      uploadedBy: userId,
    },
  });

  logger.info({ action: "MEDIA_UPLOADED", userId, mediaId: asset.id });
  await writeAuditLog({ userId, action: "CREATE", entity: "media_asset", entityId: asset.id });

  return asset;
}

export async function createMediaLink(input: CreateMediaLinkInput, userId: string) {
  const asset = await prisma.mediaAsset.create({
    data: {
      url: input.url,
      sourceType: "EXTERNAL_LINK",
      altText: input.altText,
      uploadedBy: userId,
    },
  });

  logger.info({ action: "MEDIA_LINK_ADDED", userId, mediaId: asset.id });
  await writeAuditLog({ userId, action: "CREATE", entity: "media_asset", entityId: asset.id });

  return asset;
}

export async function deleteMedia(id: string, userId: string) {
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "MEDIA_NOT_FOUND", "Media tidak ditemukan");

  if (existing.sourceType === "UPLOAD") {
    await deleteFromR2(existing.url);
  }

  await prisma.mediaAsset.delete({ where: { id } });

  logger.info({ action: "MEDIA_DELETED", userId, mediaId: id });
  await writeAuditLog({ userId, action: "DELETE", entity: "media_asset", entityId: id });
}

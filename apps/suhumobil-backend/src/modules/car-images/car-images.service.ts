import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { processImage } from "../../utils/image-processor";
import { hashBuffer } from "../../utils/file-hash";
import { uploadToR2, deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";

const MAX_IMAGES_PER_CAR = 20;
const STORAGE_QUOTA_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB (00-development-rules.md section 28)
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function getTotalStorageUsedBytes(): Promise<number> {
  const result = await prisma.carImage.aggregate({
    where: { car: { deletedAt: null } },
    _sum: { sizeBytes: true },
  });
  return result._sum.sizeBytes ?? 0;
}

export async function uploadCarImage(
  carId: string,
  file: Express.Multer.File,
  isCover: boolean
) {
  const car = await prisma.car.findFirst({ where: { id: carId, deletedAt: null } });
  if (!car) throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(422, "VALIDATION_ERROR", "Tipe file tidak didukung", {
      file: "Hanya JPG, PNG, atau WebP yang diperbolehkan",
    });
  }

  const existingCount = await prisma.carImage.count({ where: { carId } });
  if (existingCount >= MAX_IMAGES_PER_CAR) {
    throw new AppError(422, "IMAGE_LIMIT_EXCEEDED", "Maksimal 20 foto per mobil");
  }

  const fileHash = hashBuffer(file.buffer);
  const duplicate = await prisma.carImage.findFirst({ where: { carId, fileHash } });
  if (duplicate) {
    throw new AppError(409, "VALIDATION_ERROR", "Gambar ini sudah pernah diupload untuk mobil ini");
  }

  const processed = await processImage(file.buffer, 1920, 1080, 500);

  // Check storage quota BEFORE uploading to R2, using the already-known final size,
  // so we never waste an upload call when quota is full.
  const currentUsage = await getTotalStorageUsedBytes();
  if (currentUsage + processed.sizeBytes > STORAGE_QUOTA_BYTES) {
    throw new AppError(422, "STORAGE_QUOTA_EXCEEDED", "Kapasitas storage sudah penuh");
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const fileName = `${randomUUID()}.webp`;
  const key = `cars/${yyyy}/${mm}/${fileName}`;

  const url = await uploadToR2(key, processed.buffer, "image/webp");

  if (isCover) {
    await prisma.carImage.updateMany({ where: { carId }, data: { isCover: false } });
  }

  const image = await prisma.carImage.create({
    data: {
      carId,
      url,
      fileHash,
      sizeBytes: processed.sizeBytes,
      sortOrder: existingCount,
      isCover,
    },
  });

  logger.info({ action: "CAR_IMAGE_UPLOADED", carId, imageId: image.id });

  return { id: image.id, url: image.url, sortOrder: image.sortOrder, isCover: image.isCover };
}

export async function setCoverImage(carId: string, imageId: string) {
  const image = await prisma.carImage.findFirst({ where: { id: imageId, carId } });
  if (!image) throw new AppError(404, "CAR_NOT_FOUND", "Gambar tidak ditemukan");

  await prisma.$transaction([
    prisma.carImage.updateMany({ where: { carId }, data: { isCover: false } }),
    prisma.carImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);

  return { id: imageId, isCover: true };
}

export async function reorderCarImages(carId: string, items: { imageId: string; sortOrder: number }[]) {
  await prisma.$transaction(
    items.map((item) =>
      prisma.carImage.update({
        where: { id: item.imageId },
        data: { sortOrder: item.sortOrder },
      })
    )
  );
  return { carId, updated: items.length };
}

export async function deleteCarImage(carId: string, imageId: string) {
  const image = await prisma.carImage.findFirst({ where: { id: imageId, carId } });
  if (!image) throw new AppError(404, "CAR_NOT_FOUND", "Gambar tidak ditemukan");

  // Delete from R2 first, then remove the DB row (never leave orphan files).
  await deleteFromR2(image.url);
  await prisma.carImage.delete({ where: { id: imageId } });

  // Per 05-backend-prd.md section 10: if the deleted image was the cover,
  // the system does NOT auto-assign a new cover - admin must set it manually.
  logger.info({ action: "CAR_IMAGE_DELETED", carId, imageId });
}

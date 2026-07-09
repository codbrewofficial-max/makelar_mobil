import { prisma } from "../../lib/prisma";
import { processImage } from "../../utils/image-processor";
import { uploadToR2, deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import { randomUUID } from "node:crypto";

export async function uploadLogo(fileBuffer: Buffer, userId: string) {
  const processed = await processImage(fileBuffer, 512, 512, 200);
  const key = `branding/${randomUUID()}.webp`;
  const url = await uploadToR2(key, processed.buffer, "image/webp");

  const existing = await prisma.setting.findUnique({ where: { key: "business_profile" } });
  const existingValue = (existing?.value ?? {}) as any;

  // Delete old logo from R2 first to avoid orphan files (same principle as car images).
  if (existingValue.logoUrl) {
    await deleteFromR2(existingValue.logoUrl).catch((err) =>
      logger.error({ err }, "Failed to delete old logo from R2")
    );
  }

  const merged = { ...existingValue, logoUrl: url };

  await prisma.setting.upsert({
    where: { key: "business_profile" },
    update: { value: merged },
    create: { key: "business_profile", value: merged },
  });

  logger.info({ action: "LOGO_UPLOADED", userId });

  return { logoUrl: url };
}

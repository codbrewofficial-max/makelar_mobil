import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { logger } from "./logger";

const r2 = new S3Client({
  region: "auto",
  endpoint: env.r2Endpoint,
  credentials: {
    accessKeyId: env.r2AccessKey,
    secretAccessKey: env.r2SecretKey,
  },
});

/**
 * Upload a processed image buffer to Cloudflare R2 and return its public URL.
 */
export async function uploadToR2(key: string, buffer: Buffer, contentType = "image/webp"): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = env.r2PublicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}

/**
 * Delete an object from R2. Accepts either the full public URL or the raw key.
 */
export async function deleteFromR2(urlOrKey: string): Promise<void> {
  try {
    const key = urlOrKey.startsWith("http")
      ? urlOrKey.replace(`${env.r2PublicUrl.replace(/\/$/, "")}/`, "")
      : urlOrKey;

    await r2.send(
      new DeleteObjectCommand({
        Bucket: env.r2Bucket,
        Key: key,
      })
    );
  } catch (err) {
    logger.error({ err, urlOrKey }, "Failed to delete object from R2");
    throw err;
  }
}

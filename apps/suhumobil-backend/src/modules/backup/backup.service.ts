import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { uploadToR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import { AppError } from "../../types";
import { writeAuditLog } from "../../utils/audit-log";

const execAsync = promisify(exec);
const BACKUP_PREFIX = "backups/";
const MAX_BACKUPS_RETAINED = 7;
const SIGNED_URL_EXPIRY_SECONDS = 600; // 10 minutes

// Reuses the same S3-compatible client config as r2-client.ts.
// NOTE: requires the `@aws-sdk/s3-request-presigner` package (not needed elsewhere yet) — add to package.json.
const r2 = new S3Client({
  region: "auto",
  endpoint: env.r2Endpoint,
  credentials: { accessKeyId: env.r2AccessKey, secretAccessKey: env.r2SecretKey },
});

/**
 * IMPORTANT: requires `postgresql-client` (pg_dump / pg_restore CLI) to be installed
 * in the backend Docker image — see 09-perbaikan-dan-fitur-tambahan.md Section 9 assumption.
 * Add to Dockerfile: `RUN apt-get update && apt-get install -y postgresql-client`
 */

export async function exportBackup(userId: string) {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "suhumobil-backup-"));
  const dumpPath = path.join(tmpDir, "backup.dump");

  try {
    await execAsync(`pg_dump "${env.databaseUrl}" -Fc -f "${dumpPath}"`);

    const buffer = await readFile(dumpPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `${BACKUP_PREFIX}${timestamp}-${randomUUID().slice(0, 8)}.dump`;

    await uploadToR2(key, buffer, "application/octet-stream");
    await enforceRetention();

    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: env.r2Bucket, Key: key }),
      { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
    );

    logger.info({ action: "BACKUP_EXPORTED", userId, key, sizeBytes: buffer.byteLength });
    await writeAuditLog({ userId, action: "EXPORT", entity: "database", metadata: { key } });

    return { key, sizeBytes: buffer.byteLength, downloadUrl: signedUrl, expiresInSeconds: SIGNED_URL_EXPIRY_SECONDS };
  } catch (err) {
    logger.error({ err }, "pg_dump failed");
    throw new AppError(500, "BACKUP_OPERATION_FAILED", "Gagal membuat backup database");
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

export async function listBackups() {
  const result = await r2.send(new ListObjectsV2Command({ Bucket: env.r2Bucket, Prefix: BACKUP_PREFIX }));
  const items = (result.Contents ?? [])
    .map((obj) => ({ key: obj.Key!, sizeBytes: obj.Size ?? 0, lastModified: obj.LastModified }))
    .sort((a, b) => (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0));
  return items;
}

async function enforceRetention() {
  const items = await listBackups();
  if (items.length <= MAX_BACKUPS_RETAINED) return;

  const toDelete = items.slice(MAX_BACKUPS_RETAINED);
  for (const item of toDelete) {
    await r2.send(new DeleteObjectCommand({ Bucket: env.r2Bucket, Key: item.key })).catch((err) =>
      logger.error({ err, key: item.key }, "Failed to delete old backup during retention cleanup")
    );
  }
}

/**
 * DESTRUCTIVE. Restores the database from an uploaded .dump file, then bumps
 * `tokenVersion` on all users to invalidate every existing JWT session
 * (09-perbaikan-dan-fitur-tambahan.md Section 9 assumption #5).
 */
export async function restoreBackup(fileBuffer: Buffer, userId: string) {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "suhumobil-restore-"));
  const dumpPath = path.join(tmpDir, "restore.dump");

  try {
    await writeFile(dumpPath, fileBuffer);
    await execAsync(`pg_restore --clean --if-exists -d "${env.databaseUrl}" "${dumpPath}"`);

    // Invalidate all active sessions post-restore (schema data may no longer match issued JWTs).
    await prisma.user.updateMany({ data: { tokenVersion: { increment: 1 } } });

    logger.warn({ action: "DATABASE_RESTORED", userId });
    await writeAuditLog({ userId, action: "RESTORE", entity: "database" });
  } catch (err) {
    logger.error({ err }, "pg_restore failed");
    throw new AppError(500, "BACKUP_OPERATION_FAILED", "Gagal melakukan restore database");
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

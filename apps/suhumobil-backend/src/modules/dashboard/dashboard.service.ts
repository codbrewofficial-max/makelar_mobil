import { prisma } from "../../lib/prisma";
import { getTotalStorageUsedBytes } from "../car-images/car-images.service";

const STORAGE_QUOTA_MB = 1024; // 1 GB, per 00-development-rules.md section 28

export async function getDashboardStats() {
  const [totalCars, publishedCars, soldCars, totalLeads, newLeads, totalArticles, publishedArticles, storageUsedBytes] =
    await Promise.all([
      prisma.car.count({ where: { deletedAt: null } }),
      prisma.car.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
      prisma.car.count({ where: { deletedAt: null, status: "SOLD" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
      getTotalStorageUsedBytes(),
    ]);

  return {
    totalCars,
    publishedCars,
    soldCars,
    totalLeads,
    newLeads,
    totalArticles,
    publishedArticles,
    storageUsedMb: Math.round(storageUsedBytes / (1024 * 1024)),
    storageQuotaMb: STORAGE_QUOTA_MB,
  };
}

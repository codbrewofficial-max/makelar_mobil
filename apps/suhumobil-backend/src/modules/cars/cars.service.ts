import type { CarStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { generateUniqueSlug } from "../../utils/slugify";
import { sanitizeRichText } from "../../lib/sanitize";
import { deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import { writeAuditLog } from "../../utils/audit-log";
import type { CreateCarInput, UpdateCarInput, ListCarsQuery, ListAdminCarsQuery } from "./cars.schema";

/** Allowed status transitions per 04-api-contract.md section 12. */
const ALLOWED_TRANSITIONS: Record<CarStatus, CarStatus[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["SOLD", "ARCHIVED"],
  SOLD: ["PUBLISHED"],
  ARCHIVED: ["PUBLISHED"],
};

function serializeCar(car: any) {
  return {
    ...car,
    price: Number(car.price),
    mileage: Number(car.mileage),
  };
}

async function assertCuratorExists(inspectedById: string) {
  const curator = await prisma.curator.findUnique({ where: { id: inspectedById } });
  if (!curator) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");
}

// 🔧 FIX: kembali ke kontrak asli — response menyertakan `images: CarImage[]` PENUH
// (bukan cuma `coverImage` string tunggal). Frontend (Home.tsx, Catalog.tsx) melakukan
// `car.images.find(img => img.isCover)` sendiri di sisi client — menghilangkan `images`
// dari response ini menyebabkan "Cannot read properties of undefined (reading 'find')".
export async function listPublicCars(query: ListCarsQuery) {
  const { page, limit, brand, location, minPrice, maxPrice, transmission, search } = query;

  const where: any = {
    status: "PUBLISHED",
    deletedAt: null,
  };
  if (brand) where.brand = { equals: brand, mode: "insensitive" };
  if (location) where.location = { equals: location, mode: "insensitive" };
  if (transmission) where.transmission = transmission;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.car.count({ where }),
  ]);

  return {
    data: items.map(serializeCar),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPublicCarBySlug(slug: string) {
  const car = await prisma.car.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" } }, curator: true },
  });

  if (!car) {
    throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");
  }

  return serializeCar(car);
}

export async function listAdminCars(query: ListAdminCarsQuery) {
  const { page, limit, status, search } = query;
  const where: any = { deletedAt: null };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: true, curator: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.car.count({ where }),
  ]);

  return {
    data: items.map(serializeCar),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAdminCarById(id: string) {
  const car = await prisma.car.findFirst({
    where: { id, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" } }, curator: true },
  });
  if (!car) throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");
  return serializeCar(car);
}

export async function createCar(input: CreateCarInput, userId: string) {
  if (input.inspectedById) {
    await assertCuratorExists(input.inspectedById);
  }

  const slug = await generateUniqueSlug(input.title, "car");

  const car = await prisma.car.create({
    data: {
      slug,
      title: input.title,
      brand: input.brand,
      model: input.model,
      year: input.year,
      price: BigInt(Math.round(input.price)),
      mileage: input.mileage,
      transmission: input.transmission,
      fuelType: input.fuelType,
      color: input.color ?? null,
      location: input.location,
      description: sanitizeRichText(input.description),
      inspectionReport: input.inspectionReport ?? undefined,
      status: "DRAFT",
      createdBy: userId,
      inspectedBy: input.inspectedById ?? null,
    },
    include: { images: true, curator: true },
  });

  logger.info({ action: "CAR_CREATED", userId, carId: car.id });
  await writeAuditLog({ userId, action: "CREATE", entity: "car", entityId: car.id });
  return serializeCar(car);
}

export async function updateCar(id: string, input: UpdateCarInput, userId: string) {
  const existing = await prisma.car.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");

  if (input.inspectedById) {
    await assertCuratorExists(input.inspectedById);
  }

  const data: any = { ...input };
  delete data.inspectedById;
  if (input.price !== undefined) data.price = BigInt(Math.round(input.price));
  if (input.description !== undefined) data.description = sanitizeRichText(input.description);
  if (input.inspectedById !== undefined) data.inspectedBy = input.inspectedById;

  const car = await prisma.car.update({
    where: { id },
    data,
    include: { images: true, curator: true },
  });

  logger.info({ action: "CAR_UPDATED", userId, carId: car.id });
  await writeAuditLog({ userId, action: "UPDATE", entity: "car", entityId: car.id });
  return serializeCar(car);
}

export async function updateCarStatus(id: string, nextStatus: CarStatus, userId: string) {
  const car = await prisma.car.findFirst({
    where: { id, deletedAt: null },
    include: { images: true },
  });
  if (!car) throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");

  const allowed = ALLOWED_TRANSITIONS[car.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Transisi status dari ${car.status} ke ${nextStatus} tidak diizinkan`
    );
  }

  if (nextStatus === "PUBLISHED" && car.images.length < 5) {
    throw new AppError(
      422,
      "IMAGE_MINIMUM_NOT_MET",
      "Mobil membutuhkan minimal 5 foto sebelum dipublikasikan"
    );
  }

  const updated = await prisma.car.update({ where: { id }, data: { status: nextStatus } });
  logger.info({ action: "CAR_STATUS_UPDATED", userId, carId: id, status: nextStatus });
  await writeAuditLog({ userId, action: "UPDATE", entity: "car", entityId: id, metadata: { status: nextStatus } });
  return { id: updated.id, status: updated.status };
}

export async function deleteCar(id: string, userId: string) {
  const car = await prisma.car.findFirst({
    where: { id, deletedAt: null },
    include: { images: true },
  });
  if (!car) throw new AppError(404, "CAR_NOT_FOUND", "Mobil tidak ditemukan");

  for (const image of car.images) {
    await deleteFromR2(image.url);
  }

  await prisma.$transaction([
    prisma.carImage.deleteMany({ where: { carId: id } }),
    prisma.car.update({ where: { id }, data: { deletedAt: new Date() } }),
  ]);

  logger.info({ action: "CAR_DELETED", userId, carId: id });
  await writeAuditLog({ userId, action: "DELETE", entity: "car", entityId: id });
}
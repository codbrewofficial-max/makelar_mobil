import { z } from "zod";

const currentYear = new Date().getFullYear();

const inspectionCategorySchema = z.object({
  status: z.enum(["good", "minor", "bad"]),
  note: z.string().optional().default(""),
});

export const inspectionReportSchema = z
  .object({
    mesin: inspectionCategorySchema.optional(),
    transmisi: inspectionCategorySchema.optional(),
    bodi: inspectionCategorySchema.optional(),
    interior: inspectionCategorySchema.optional(),
    kakiKaki: inspectionCategorySchema.optional(),
    kelistrikan: inspectionCategorySchema.optional(),
    catatanKhusus: z.string().optional(),
    inspectedBy: z.string().optional(),
    inspectedAt: z.string().optional(),
  })
  .partial();

export const createCarSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(150),
  brand: z.string().min(1, "Merek wajib diisi").max(50),
  model: z.string().min(1, "Model wajib diisi").max(50),
  year: z.coerce
    .number()
    .int()
    .min(1990, "Tahun minimal 1990")
    .max(currentYear, `Tahun maksimal ${currentYear}`),
  price: z.coerce.number().positive("Harga harus angka positif"),
  mileage: z.coerce.number().int().nonnegative("Jarak tempuh harus angka positif"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "CVT"]),
  fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"]),
  color: z.string().max(30).optional().nullable(),
  location: z.string().min(1, "Lokasi wajib diisi").max(100),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  inspectionReport: inspectionReportSchema.optional().nullable(),
});

export const updateCarSchema = createCarSchema.partial();

export const updateCarStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD", "ARCHIVED"]),
});

export const listCarsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  brand: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "CVT"]).optional(),
  search: z.string().optional(),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type ListCarsQuery = z.infer<typeof listCarsQuerySchema>;

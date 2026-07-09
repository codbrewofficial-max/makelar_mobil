import { z } from "zod";

export const createCuratorSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  role: z.string().max(100).optional().default("Kurator Utama"),
  description: z.string().min(1, "Deskripsi wajib diisi").max(2000, "Deskripsi maksimal 2000 karakter"),
});

export const updateCuratorSchema = createCuratorSchema.partial();

export const listCuratorsQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateCuratorInput = z.infer<typeof createCuratorSchema>;
export type UpdateCuratorInput = z.infer<typeof updateCuratorSchema>;
export type ListCuratorsQuery = z.infer<typeof listCuratorsQuerySchema>;

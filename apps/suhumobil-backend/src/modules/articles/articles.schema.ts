import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  excerpt: z.string().min(1, "Excerpt wajib diisi").max(300),
  content: z.string().min(1, "Konten wajib diisi").max(50000),
  tags: z.array(z.string()).max(5, "Maksimal 5 tag").optional().default([]),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const updateArticleStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const listArticlesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export const listAdminArticlesQuerySchema = listArticlesQuerySchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

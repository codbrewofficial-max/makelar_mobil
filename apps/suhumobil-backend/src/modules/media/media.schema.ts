import { z } from "zod";

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  sourceType: z.enum(["UPLOAD", "EXTERNAL_LINK", "AI_GENERATED"]).optional(),
});

export const createMediaLinkSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().max(255).optional(),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type CreateMediaLinkInput = z.infer<typeof createMediaLinkSchema>;

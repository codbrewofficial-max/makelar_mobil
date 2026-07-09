import { z } from "zod";
import { optionalQuery } from "../../utils/zod-helpers";

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  sourceType: optionalQuery(z.enum(["UPLOAD", "EXTERNAL_LINK", "AI_GENERATED"])),
});

export const createMediaLinkSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().max(255).optional(),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type CreateMediaLinkInput = z.infer<typeof createMediaLinkSchema>;

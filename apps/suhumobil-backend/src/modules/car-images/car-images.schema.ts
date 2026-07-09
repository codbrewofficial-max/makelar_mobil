import { z } from "zod";

export const uploadImageBodySchema = z.object({
  isCover: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => (typeof v === "string" ? v === "true" : v ?? false)),
});

// Body is a raw array of { imageId, sortOrder } per 05-backend-prd.md section 10.
export const reorderImagesSchema = z
  .array(
    z.object({
      imageId: z.string().uuid(),
      sortOrder: z.coerce.number().int().nonnegative(),
    })
  )
  .min(1);

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

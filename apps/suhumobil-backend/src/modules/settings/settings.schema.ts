import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    siteTitle: z.string().optional(),
    whatsappNumber: z.string().optional(),
    socialLinks: z
      .object({
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
    watermark: z
      .object({
        label: z.string(),
        link: z.string(),
      })
      .optional(),
    businessProfile: z
      .object({
        name: z.string().optional(),
        tagline: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    gtmId: z.string().optional(),
    ga4Id: z.string().optional(),
  })
  .partial();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

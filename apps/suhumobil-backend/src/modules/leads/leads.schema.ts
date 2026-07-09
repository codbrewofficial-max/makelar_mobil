import { z } from "zod";

const baseLeadFields = {
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Format email tidak valid").optional().nullable(),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  city: z.string().max(100).optional().nullable(),
  budget: z.coerce.number().positive().optional().nullable(),
  carInterest: z.string().max(150).optional().nullable(),
  subject: z.enum(["PRICE_INQUIRY", "NEGOTIATION", "SCHEDULE_SURVEY", "OTHER"]).optional().nullable(),
  message: z.string().optional().nullable(),
  carId: z.string().uuid().optional().nullable(),
  // Referral channel that led the visitor here (e.g. "instagram"), used only to write a
  // TrackingLog(type: LEAD) row - NOT persisted as a column on Lead itself.
  // See 07-frontend-reconciliation-addendum.md Section 7 / 08-instruksi Section 4.
  landingSource: z.string().min(1).max(30).optional().nullable(),
};

export const createLeadSchema = z
  .object({
    ...baseLeadFields,
    source: z.enum(["WHATSAPP_CTA", "WHATSAPP_FAB", "DREAM_CAR_FORM", "CONTACT_PAGE"]),
  })
  .superRefine((data, ctx) => {
    // subject is required for WHATSAPP_CTA and WHATSAPP_FAB (04-api-contract.md section 11).
    if ((data.source === "WHATSAPP_CTA" || data.source === "WHATSAPP_FAB") && !data.subject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subjek wajib diisi untuk sumber ini",
        path: ["subject"],
      });
    }
    if (data.source === "WHATSAPP_CTA" && !data.carId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "carId wajib diisi untuk WHATSAPP_CTA",
        path: ["carId"],
      });
    }
  });

export const updateLeadSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "REJECTED"]).optional(),
  notes: z.string().optional().nullable(),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "REJECTED"]).optional(),
  source: z.enum(["WHATSAPP_CTA", "WHATSAPP_FAB", "DREAM_CAR_FORM", "CONTACT_PAGE"]).optional(),
  search: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

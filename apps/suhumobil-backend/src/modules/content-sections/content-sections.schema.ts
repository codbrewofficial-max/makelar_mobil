import { z } from "zod";

/**
 * Whitelist of valid `page` + `sectionKey` combinations.
 * Reject anything not listed here with 422 INVALID_SECTION_KEY.
 * Add new rows here whenever a new editable section is introduced —
 * no database migration needed (09-perbaikan-dan-fitur-tambahan.md Section 4).
 */
export const SECTION_SCHEMAS: Record<string, Record<string, z.ZodTypeAny>> = {
  landing: {
    hero: z.object({
      headline: z.string().min(1).max(150),
      subheadline: z.string().min(1).max(300),
      ctaLabel: z.string().min(1).max(50),
    }),
    trust: z.object({
      items: z
        .array(
          z.object({
            icon: z.string().min(1).max(50),
            title: z.string().min(1).max(80),
            description: z.string().min(1).max(300),
          })
        )
        .min(1)
        .max(6),
    }),
    about_curator_summary: z.object({
      headline: z.string().min(1).max(150),
      narrative: z.string().min(1).max(1000),
    }),
    cta_footer: z.object({
      headline: z.string().min(1).max(150),
      ctaLabel: z.string().min(1).max(50),
    }),
  },
  about: {
    story: z.object({
      headline: z.string().min(1).max(150),
      // Rich text - sanitized with sanitize-html before persisting, see service.
      content: z.string().min(1),
    }),
  },
  footer: {
    general: z.object({
      description: z.string().min(1).max(300),
      copyrightText: z.string().min(1).max(200),
    }),
  },
  contact: {
    intro: z.object({
      headline: z.string().min(1).max(150),
      description: z.string().min(1).max(500),
    }),
  },
};

export const updateContentSectionBodySchema = z.object({
  content: z.record(z.any()),
});

export type UpdateContentSectionBody = z.infer<typeof updateContentSectionBodySchema>;

export function isValidSectionKey(page: string, sectionKey: string): boolean {
  return Boolean(SECTION_SCHEMAS[page]?.[sectionKey]);
}

export function getSectionContentSchema(page: string, sectionKey: string): z.ZodTypeAny | undefined {
  return SECTION_SCHEMAS[page]?.[sectionKey];
}

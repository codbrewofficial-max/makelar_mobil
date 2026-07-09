import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { sanitizeRichText } from "../../lib/sanitize";
import { logger } from "../../lib/logger";
import { writeAuditLog } from "../../utils/audit-log";
import { isValidSectionKey, getSectionContentSchema } from "./content-sections.schema";

/**
 * Fallback defaults so pages never render empty/broken before an admin
 * has edited a section for the first time (09 Section 4).
 * These mirror whatever copy currently lives hardcoded in the frontend —
 * LabKerKom should double check these match the real current copy.
 */
const DEFAULTS: Record<string, Record<string, unknown>> = {
  landing: {
    hero: {
      headline: "Mobil Bekas Terkurasi & Terpercaya",
      subheadline: "Setiap unit diperiksa tenaga ahli berpengalaman 25 tahun sebelum sampai ke tangan Anda.",
      ctaLabel: "Lihat Katalog",
    },
    trust: {
      items: [
        { icon: "shield", title: "Kurasi Mutlak", description: "Setiap unit lolos inspeksi ketat." },
        { icon: "eye", title: "Transparansi", description: "Laporan kondisi apa adanya." },
        { icon: "message-circle", title: "Konsultasi Personal", description: "Tanya langsung via WhatsApp." },
      ],
    },
    about_curator_summary: {
      headline: "Tentang Kurator Kami",
      narrative: "Berpengalaman 25 tahun di dunia otomotif.",
    },
    cta_footer: {
      headline: "Cari Mobil Impian Anda",
      ctaLabel: "Hubungi Kami",
    },
  },
  about: {
    story: {
      headline: "Tentang SuhuMobil",
      content: "<p>Cerita 25 tahun pengalaman kami di dunia otomotif.</p>",
    },
  },
  footer: {
    general: {
      description: "Platform mobil bekas terkurasi & terpercaya.",
      copyrightText: `© ${new Date().getFullYear()} SuhuMobil. All rights reserved.`,
    },
  },
  contact: {
    intro: {
      headline: "Hubungi Kami",
      description: "Ada pertanyaan? Kontak tim kami langsung.",
    },
  },
};

// sectionKeys whose `content.<field>` needs sanitize-html (rich text fields).
const RICH_TEXT_FIELDS: Record<string, string[]> = {
  "about.story": ["content"],
};

export async function getPageSections(page: string) {
  if (!DEFAULTS[page]) {
    throw new AppError(422, "INVALID_SECTION_KEY", `Halaman '${page}' tidak dikenal`);
  }

  const rows = await prisma.contentSection.findMany({ where: { page } });
  const rowMap = new Map(rows.map((r) => [r.sectionKey, r.content]));

  const result: Record<string, unknown> = {};
  for (const sectionKey of Object.keys(DEFAULTS[page])) {
    result[sectionKey] = rowMap.get(sectionKey) ?? DEFAULTS[page][sectionKey];
  }
  return result;
}

export async function upsertSection(
  page: string,
  sectionKey: string,
  content: Record<string, unknown>,
  userId: string
) {
  if (!isValidSectionKey(page, sectionKey)) {
    throw new AppError(422, "INVALID_SECTION_KEY", `Section '${sectionKey}' tidak dikenal untuk halaman '${page}'`);
  }

  const schema = getSectionContentSchema(page, sectionKey)!;
  const parsed = schema.parse(content); // throws ZodError -> caught by global error handler as 422

  const richTextFields = RICH_TEXT_FIELDS[`${page}.${sectionKey}`] ?? [];
  const finalContent: Record<string, unknown> = { ...parsed };
  for (const field of richTextFields) {
    if (typeof finalContent[field] === "string") {
      finalContent[field] = sanitizeRichText(finalContent[field] as string);
    }
  }

  const section = await prisma.contentSection.upsert({
    where: { page_sectionKey: { page, sectionKey } },
    update: { content: finalContent as any, updatedBy: userId },
    create: { page, sectionKey, content: finalContent as any, updatedBy: userId },
  });

  logger.info({ action: "CONTENT_SECTION_UPDATED", userId, page, sectionKey });
  await writeAuditLog({
    userId,
    action: "UPDATE",
    entity: "content_section",
    entityId: section.id,
    metadata: { page, sectionKey },
  });

  return { page, sectionKey, content: section.content };
}

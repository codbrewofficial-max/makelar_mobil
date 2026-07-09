import { prisma } from "../../lib/prisma";
import { sanitizeRichText } from "../../lib/sanitize";
import { logger } from "../../lib/logger";
import type { UpdateSettingsInput } from "./settings.schema";

// Maps camelCase API keys <-> snake_case DB keys (settings.key column).
const KEY_MAP: Record<string, string> = {
  siteTitle: "site_title",
  whatsappNumber: "whatsapp_number",
  socialLinks: "social_links",
  watermark: "watermark",
  businessProfile: "business_profile",
  gtmId: "gtm_id",
  ga4Id: "ga4_id",
};

// Keys allowed to be exposed via GET /settings/public (03-database-design.md section 10).
const PUBLIC_KEYS = ["site_title", "whatsapp_number", "social_links", "watermark", "business_profile", "gtm_id", "ga4_id"];

async function getAllSettingsRaw(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getPublicSettings() {
  const raw = await getAllSettingsRaw();

  const businessProfile = (raw.business_profile ?? {}) as any;

  return {
    siteTitle: raw.site_title ?? null,
    whatsappNumber: raw.whatsapp_number ?? null,
    socialLinks: raw.social_links ?? {},
    watermark: raw.watermark ?? {},
    businessProfile: {
      logoUrl: businessProfile.logoUrl ?? null,
      name: businessProfile.name ?? null,
      tagline: businessProfile.tagline ?? null,
    },
    gtmId: raw.gtm_id ?? null,
    ga4Id: raw.ga4_id ?? null,
  };
}

export async function getAdminSettings() {
  const raw = await getAllSettingsRaw();
  // Convert snake_case DB keys back to camelCase for the admin API response.
  const camel: Record<string, unknown> = {};
  for (const [camelKey, dbKey] of Object.entries(KEY_MAP)) {
    camel[camelKey] = raw[dbKey] ?? null;
  }
  // storageQuotaGb intentionally kept internal-ish but still visible to admin.
  camel.storageQuotaGb = raw.storage_quota_gb ?? null;
  return camel;
}

export async function updateSettings(input: UpdateSettingsInput, userId: string) {
  const entries = Object.entries(input) as [string, unknown][];

  for (const [camelKey, value] of entries) {
    if (value === undefined) continue;
    const dbKey = KEY_MAP[camelKey];
    if (!dbKey) continue;

    let finalValue = value;

    if (camelKey === "businessProfile") {
      const existing = await prisma.setting.findUnique({ where: { key: "business_profile" } });
      const existingValue = (existing?.value ?? {}) as any;
      const incoming = value as any;
      finalValue = {
        ...existingValue,
        ...incoming,
        ...(incoming.description !== undefined
          ? { description: sanitizeRichText(incoming.description) }
          : {}),
      };
    }

    await prisma.setting.upsert({
      where: { key: dbKey },
      update: { value: finalValue as any },
      create: { key: dbKey, value: finalValue as any },
    });
  }

  logger.info({ action: "SETTINGS_UPDATED", userId, keys: entries.map(([k]) => k) });

  return getAdminSettings();
}

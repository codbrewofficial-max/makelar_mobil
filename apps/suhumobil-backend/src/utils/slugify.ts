import { prisma } from "../lib/prisma";

function baseSlugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Generate a unique, URL-safe slug for the given model ("car" | "article").
 * If the base slug already exists, append a random 4-char suffix.
 */
export async function generateUniqueSlug(
  title: string,
  model: "car" | "article"
): Promise<string> {
  const base = baseSlugify(title);
  const delegate = model === "car" ? prisma.car : prisma.article;

  const existing = await (delegate as any).findUnique({ where: { slug: base } });
  if (!existing) return base;

  // Retry a few times in the (very unlikely) case of a collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomSuffix()}`;
    const found = await (delegate as any).findUnique({ where: { slug: candidate } });
    if (!found) return candidate;
  }

  // Extremely unlikely fallback.
  return `${base}-${Date.now()}`;
}

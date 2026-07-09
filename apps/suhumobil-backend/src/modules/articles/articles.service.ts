import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { generateUniqueSlug } from "../../utils/slugify";
import { sanitizeRichText } from "../../lib/sanitize";
import { estimateReadingTimeMinutes } from "../../utils/reading-time";
import { deleteFromR2 } from "../../lib/r2-client";
import { logger } from "../../lib/logger";
import type { CreateArticleInput, UpdateArticleInput } from "./articles.schema";

function publicArticleCard(article: any) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    tags: article.tags,
    readingTimeMinutes: article.readingTimeMinutes,
    publishedAt: article.publishedAt,
  };
}

function publicArticleDetail(article: any) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    tags: article.tags,
    readingTimeMinutes: article.readingTimeMinutes,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    publishedAt: article.publishedAt,
  };
}

export async function listPublicArticles(query: { page: number; limit: number; tag?: string; search?: string }) {
  const { page, limit, tag, search } = query;
  const where: any = { status: "PUBLISHED", deletedAt: null };
  if (tag) where.tags = { has: tag };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    data: items.map(publicArticleCard),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPublicArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED", deletedAt: null } });
  if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");
  return publicArticleDetail(article);
}

export async function listAdminArticles(query: { status?: string; search?: string }) {
  const where: any = { deletedAt: null };
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { excerpt: { contains: query.search, mode: "insensitive" } },
    ];
  }
  return prisma.article.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getAdminArticleById(id: string) {
  const article = await prisma.article.findFirst({ where: { id, deletedAt: null } });
  if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");
  return article;
}

export async function createArticle(input: CreateArticleInput, userId: string) {
  const slug = await generateUniqueSlug(input.title, "article");
  const sanitizedContent = sanitizeRichText(input.content);
  const readingTimeMinutes = estimateReadingTimeMinutes(sanitizedContent);

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: sanitizedContent,
      tags: input.tags ?? [],
      readingTimeMinutes,
      status: "DRAFT",
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      authorId: userId,
      coverImage: null,
    },
  });

  logger.info({ action: "ARTICLE_CREATED", userId, articleId: article.id });
  return article;
}

export async function updateArticle(id: string, input: UpdateArticleInput, userId: string) {
  const existing = await prisma.article.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");

  const data: any = { ...input };
  if (input.content !== undefined) {
    data.content = sanitizeRichText(input.content);
    data.readingTimeMinutes = estimateReadingTimeMinutes(data.content);
  }
  // Slug never changes on update, same rationale as cars.

  const article = await prisma.article.update({ where: { id }, data });
  logger.info({ action: "ARTICLE_UPDATED", userId, articleId: id });
  return article;
}

export async function updateArticleStatus(id: string, status: "DRAFT" | "PUBLISHED", userId: string) {
  const article = await prisma.article.findFirst({ where: { id, deletedAt: null } });
  if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");

  if (status === "PUBLISHED" && !article.coverImage) {
    throw new AppError(422, "VALIDATION_ERROR", "Cover image wajib diisi sebelum publish", {
      coverImage: "Upload cover terlebih dahulu",
    });
  }

  const data: any = { status };
  // publishedAt is set once on first publish and never reset afterwards.
  if (status === "PUBLISHED" && !article.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await prisma.article.update({ where: { id }, data });
  logger.info({ action: "ARTICLE_STATUS_UPDATED", userId, articleId: id, status });
  return { id: updated.id, status: updated.status, publishedAt: updated.publishedAt };
}

export async function uploadArticleCoverUrl(id: string, url: string, userId: string) {
  const article = await prisma.article.findFirst({ where: { id, deletedAt: null } });
  if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");

  if (article.coverImage) {
    await deleteFromR2(article.coverImage);
  }

  const updated = await prisma.article.update({ where: { id }, data: { coverImage: url } });
  logger.info({ action: "ARTICLE_COVER_UPLOADED", userId, articleId: id });
  return { coverImage: updated.coverImage };
}

export async function deleteArticle(id: string, userId: string) {
  const article = await prisma.article.findFirst({ where: { id, deletedAt: null } });
  if (!article) throw new AppError(404, "ARTICLE_NOT_FOUND", "Artikel tidak ditemukan");

  if (article.coverImage) {
    await deleteFromR2(article.coverImage);
  }

  await prisma.article.update({ where: { id }, data: { deletedAt: new Date() } });
  logger.info({ action: "ARTICLE_DELETED", userId, articleId: id });
}

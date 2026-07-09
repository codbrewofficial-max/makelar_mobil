import type { Request, Response } from "express";
import {
  listPublicArticles,
  getPublicArticleBySlug,
  listAdminArticles,
  getAdminArticleById,
  createArticle,
  updateArticle,
  updateArticleStatus,
  uploadArticleCoverUrl,
  deleteArticle,
} from "./articles.service";
import { processImage } from "../../utils/image-processor";
import { uploadToR2 } from "../../lib/r2-client";
import { success, failure } from "../../utils/response";
import { randomUUID } from "node:crypto";
import { getParam } from "../../utils/http";

export async function getArticles(req: Request, res: Response) {
  const query = (req as any).validatedQuery;
  const { data, meta } = await listPublicArticles(query);
  res.status(200).json(success(data, "Success", meta));
}

export async function getArticleBySlug(req: Request, res: Response) {
  const article = await getPublicArticleBySlug(getParam(req, "slug"));
  res.status(200).json(success(article));
}

export async function getAdminArticles(req: Request, res: Response) {
  const query = (req as any).validatedQuery ?? {};
  const articles = await listAdminArticles(query);
  res.status(200).json(success(articles));
}

export async function getAdminArticleDetail(req: Request, res: Response) {
  const article = await getAdminArticleById(getParam(req, "id"));
  res.status(200).json(success(article));
}

export async function postArticle(req: Request, res: Response) {
  const article = await createArticle(req.body, req.user!.id);
  res.status(201).json(success(article));
}

export async function putArticle(req: Request, res: Response) {
  const article = await updateArticle(getParam(req, "id"), req.body, req.user!.id);
  res.status(200).json(success(article));
}

export async function patchArticleStatus(req: Request, res: Response) {
  const result = await updateArticleStatus(getParam(req, "id"), req.body.status, req.user!.id);
  res.status(200).json(success(result));
}

export async function postArticleCover(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File wajib diupload" }));
  }
  const processed = await processImage(req.file.buffer, 1920, 1080, 500);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const key = `articles/${yyyy}/${mm}/${randomUUID()}.webp`;
  const url = await uploadToR2(key, processed.buffer, "image/webp");

  const result = await uploadArticleCoverUrl(getParam(req, "id"), url, req.user!.id);
  res.status(200).json(success(result));
}

export async function removeArticle(req: Request, res: Response) {
  await deleteArticle(getParam(req, "id"), req.user!.id);
  res.status(200).json(success(null));
}

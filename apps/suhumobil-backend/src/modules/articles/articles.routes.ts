import { Router } from "express";
import multer from "multer";
import {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  getAdminArticleDetail,
  postArticle,
  putArticle,
  patchArticleStatus,
  postArticleCover,
  removeArticle,
} from "./articles.controller";
import { validateBody, validateQuery } from "../../middleware/validate-request";
import {
  createArticleSchema,
  updateArticleSchema,
  updateArticleStatusSchema,
  listArticlesQuerySchema,
  listAdminArticlesQuerySchema,
} from "./articles.schema";
import { authGuard } from "../../middleware/auth-guard";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// Public
router.get("/articles", validateQuery(listArticlesQuerySchema), getArticles);
router.get("/articles/:slug", getArticleBySlug);

// Admin
router.get("/admin/articles", authGuard, validateQuery(listAdminArticlesQuerySchema), getAdminArticles);
router.get("/admin/articles/:id", authGuard, getAdminArticleDetail);
router.post("/admin/articles", authGuard, validateBody(createArticleSchema), postArticle);
router.put("/admin/articles/:id", authGuard, validateBody(updateArticleSchema), putArticle);
router.patch("/admin/articles/:id/status", authGuard, validateBody(updateArticleStatusSchema), patchArticleStatus);
router.post("/admin/articles/:id/cover", authGuard, upload.single("file"), postArticleCover);
router.delete("/admin/articles/:id", authGuard, removeArticle);

export default router;

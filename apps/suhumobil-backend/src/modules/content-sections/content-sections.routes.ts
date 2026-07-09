import { Router } from "express";
import { getContentByPage, putContentSection } from "./content-sections.controller";
import { validateBody } from "../../middleware/validate-request";
import { updateContentSectionBodySchema } from "./content-sections.schema";
import { authGuard } from "../../middleware/auth-guard";

const router = Router();

// Public
router.get("/content/:page", getContentByPage);

// Admin (same data, kept separate to match the 🔒 vs public route convention)
router.get("/admin/content/:page", authGuard, getContentByPage);
router.put(
  "/admin/content/:page/:sectionKey",
  authGuard,
  validateBody(updateContentSectionBodySchema),
  putContentSection
);

export default router;

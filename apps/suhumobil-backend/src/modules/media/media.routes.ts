import { Router } from "express";
import multer from "multer";
import { getMedia, postMediaUpload, postMediaLink, removeMedia } from "./media.controller";
import { validateBody, validateQuery } from "../../middleware/validate-request";
import { listMediaQuerySchema, createMediaLinkSchema } from "./media.schema";
import { authGuard } from "../../middleware/auth-guard";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.get("/admin/media", authGuard, validateQuery(listMediaQuerySchema), getMedia);
router.post("/admin/media/upload", authGuard, upload.single("file"), postMediaUpload);
router.post("/admin/media/link", authGuard, validateBody(createMediaLinkSchema), postMediaLink);
router.delete("/admin/media/:id", authGuard, removeMedia);

// NOTE: POST /admin/media/generate (AI_GENERATED) intentionally NOT implemented yet
// per LabKerKom's confirmed scope (YAGNI) - add it here once an AI image provider is chosen.

export default router;

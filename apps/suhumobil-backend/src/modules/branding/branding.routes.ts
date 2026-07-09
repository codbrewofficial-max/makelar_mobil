import { Router } from "express";
import multer from "multer";
import { postBrandingLogo } from "./branding.controller";
import { authGuard } from "../../middleware/auth-guard";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post("/admin/settings/branding/logo", authGuard, upload.single("file"), postBrandingLogo);

export default router;

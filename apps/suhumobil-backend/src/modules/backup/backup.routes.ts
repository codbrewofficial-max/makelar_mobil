import { Router } from "express";
import multer from "multer";
import { postBackupExport, getBackupList, postBackupRestore } from "./backup.controller";
import { validateBody } from "../../middleware/validate-request";
import { restoreConfirmSchema } from "./backup.schema";
import { authGuard } from "../../middleware/auth-guard";
import { roleGuard } from "../../middleware/role-guard";

// .dump files can be large; 200MB ceiling is generous for an MVP-scale database.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
const router = Router();

// All backup/restore endpoints are OWNER only (09-perbaikan-dan-fitur-tambahan.md Section 9).
router.post("/admin/backup/export", authGuard, roleGuard(["OWNER"]), postBackupExport);
router.get("/admin/backup/list", authGuard, roleGuard(["OWNER"]), getBackupList);
router.post(
  "/admin/backup/restore",
  authGuard,
  roleGuard(["OWNER"]),
  upload.single("file"),
  validateBody(restoreConfirmSchema),
  postBackupRestore
);

export default router;

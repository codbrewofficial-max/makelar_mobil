import { Router } from "express";
import multer from "multer";
import {
  getCurators,
  getCuratorDetail,
  postCurator,
  putCurator,
  postCuratorPhoto,
  removeCurator,
} from "./curators.controller";
import { validateBody, validateQuery } from "../../middleware/validate-request";
import { createCuratorSchema, updateCuratorSchema, listCuratorsQuerySchema } from "./curators.schema";
import { authGuard } from "../../middleware/auth-guard";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// Public
router.get("/curators", validateQuery(listCuratorsQuerySchema), getCurators);
router.get("/curators/:id", getCuratorDetail);

// Admin
router.post("/admin/curators", authGuard, validateBody(createCuratorSchema), postCurator);
router.put("/admin/curators/:id", authGuard, validateBody(updateCuratorSchema), putCurator);
router.post("/admin/curators/:id/photo", authGuard, upload.single("file"), postCuratorPhoto);
router.delete("/admin/curators/:id", authGuard, removeCurator);

export default router;

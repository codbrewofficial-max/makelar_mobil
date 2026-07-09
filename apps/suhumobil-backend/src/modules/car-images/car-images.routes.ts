import { Router } from "express";
import multer from "multer";
import { postCarImage, patchCoverImage, putReorderImages, removeCarImage } from "./car-images.controller";
import { authGuard } from "../../middleware/auth-guard";
import { validateBody } from "../../middleware/validate-request";
import { reorderImagesSchema } from "./car-images.schema";

// Memory storage only - the raw file is never written to disk (00-development-rules.md section 33).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = Router();

router.post("/admin/cars/:id/images", authGuard, upload.single("file"), postCarImage);
router.patch("/admin/cars/:id/images/:imageId/cover", authGuard, patchCoverImage);
router.put("/admin/cars/:id/images/reorder", authGuard, validateBody(reorderImagesSchema as any), putReorderImages);
router.delete("/admin/cars/:id/images/:imageId", authGuard, removeCarImage);

export default router;

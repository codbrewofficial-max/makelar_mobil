import { Router } from "express";
import { getSettingsPublic, getSettingsAdmin, putSettingsAdmin } from "./settings.controller";
import { validateBody } from "../../middleware/validate-request";
import { updateSettingsSchema } from "./settings.schema";
import { authGuard } from "../../middleware/auth-guard";
import brandingRouter from "../branding/branding.routes";

const router = Router();

router.get("/settings/public", getSettingsPublic);
router.get("/admin/settings", authGuard, getSettingsAdmin);
router.put("/admin/settings", authGuard, validateBody(updateSettingsSchema), putSettingsAdmin);

router.use(brandingRouter);

export default router;

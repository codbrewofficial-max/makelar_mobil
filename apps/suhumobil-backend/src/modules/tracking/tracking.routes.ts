import { Router } from "express";
import { postVisit, postClick, getInsights } from "./tracking.controller";
import { validateBody } from "../../middleware/validate-request";
import { trackEventSchema } from "./tracking.schema";
import { authGuard } from "../../middleware/auth-guard";
import { trackingRateLimiter } from "../../middleware/rate-limiter";

const router = Router();

// Public - called automatically on pageview/copy-link, hence the stricter dedicated rate limit.
router.post("/tracking/visit", trackingRateLimiter, validateBody(trackEventSchema), postVisit);
router.post("/tracking/click", trackingRateLimiter, validateBody(trackEventSchema), postClick);

// Admin
router.get("/admin/insights/system", authGuard, getInsights);

export default router;

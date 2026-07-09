import { Router } from "express";
import { postLead, getAdminLeads, getAdminLeadDetail, patchAdminLead } from "./leads.controller";
import { validateBody, validateQuery } from "../../middleware/validate-request";
import { createLeadSchema, updateLeadSchema, listLeadsQuerySchema } from "./leads.schema";
import { authGuard } from "../../middleware/auth-guard";
import { leadsRateLimiter } from "../../middleware/rate-limiter";

const router = Router();

// Public - no DELETE endpoint exists anywhere for leads (hard business rule).
router.post("/leads", leadsRateLimiter, validateBody(createLeadSchema), postLead);

// Admin
router.get("/admin/leads", authGuard, validateQuery(listLeadsQuerySchema), getAdminLeads);
router.get("/admin/leads/:id", authGuard, getAdminLeadDetail);
router.patch("/admin/leads/:id", authGuard, validateBody(updateLeadSchema), patchAdminLead);

export default router;

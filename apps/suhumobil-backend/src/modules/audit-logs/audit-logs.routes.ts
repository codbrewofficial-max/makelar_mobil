import { Router } from "express";
import { getAuditLogs } from "./audit-logs.controller";
import { validateQuery } from "../../middleware/validate-request";
import { listAuditLogsQuerySchema } from "./audit-logs.schema";
import { authGuard } from "../../middleware/auth-guard";
import { roleGuard } from "../../middleware/role-guard";

const router = Router();

// Assumption #7 (09-perbaikan-dan-fitur-tambahan.md Section 11): OWNER only.
// If LabKerKom wants ADMIN to also see this, just remove the roleGuard line below.
router.get(
  "/admin/audit-logs",
  authGuard,
  roleGuard(["OWNER"]),
  validateQuery(listAuditLogsQuerySchema),
  getAuditLogs
);

export default router;

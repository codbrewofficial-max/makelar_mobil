import { Router } from "express";
import { getStats } from "./dashboard.controller";
import { authGuard } from "../../middleware/auth-guard";

const router = Router();

router.get("/admin/dashboard/stats", authGuard, getStats);

export default router;

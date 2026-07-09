import { Router } from "express";
import { login, logout, me } from "./auth.controller";
import { validateBody } from "../../middleware/validate-request";
import { loginSchema } from "./auth.schema";
import { authGuard } from "../../middleware/auth-guard";
import { loginRateLimiter } from "../../middleware/rate-limiter";

const router = Router();

router.post("/auth/login", loginRateLimiter, validateBody(loginSchema), login);
router.post("/auth/logout", authGuard, logout);
router.get("/auth/me", authGuard, me);

export default router;

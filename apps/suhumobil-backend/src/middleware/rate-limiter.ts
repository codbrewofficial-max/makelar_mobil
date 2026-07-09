import rateLimit from "express-rate-limit";
import { failure } from "../utils/response";

/**
 * Rate limiters per 04-api-contract.md section 16 / 05-backend-prd.md section 6.4.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure("Terlalu banyak permintaan, coba lagi nanti", { code: "RATE_LIMIT_EXCEEDED" }));
  },
});

export const leadsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure("Terlalu banyak permintaan, coba lagi nanti", { code: "RATE_LIMIT_EXCEEDED" }));
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure("Terlalu banyak permintaan, coba lagi nanti", { code: "RATE_LIMIT_EXCEEDED" }));
  },
});

// Called automatically on every pageview/copy-link (not a deliberate user action like
// submitting a form), so it's more prone to spam/flood than /leads but should still be
// looser than the 5/min form limit (07-addendum Section 6 / 08-instruksi Section 6).
export const trackingRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure("Terlalu banyak permintaan, coba lagi nanti", { code: "RATE_LIMIT_EXCEEDED" }));
  },
});

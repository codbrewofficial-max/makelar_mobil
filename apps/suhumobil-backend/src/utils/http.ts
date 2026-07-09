import type { Request } from "express";

/**
 * Express 5's ParamsDictionary types route params as `string | string[]`
 * (to account for repeated wildcard segments). None of our routes use
 * wildcards, so every param here is always a single string - this helper
 * just gives TypeScript that guarantee at the call site.
 */
export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

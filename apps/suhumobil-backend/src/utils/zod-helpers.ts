import { z } from "zod";

/**
 * Query string params are always strings. When a Postman/frontend filter is left
 * blank (e.g. `?status=&search=`), Express gives us an empty string "" — NOT
 * `undefined`. Zod's `.optional()` only treats `undefined` as "not provided", so
 * an empty-string enum/uuid/date filter fails validation instead of being skipped.
 *
 * Wrap any OPTIONAL query field with this helper so blank values are treated as
 * absent. Example: `status: optionalQuery(z.enum(["DRAFT", "PUBLISHED"]))`.
 */
export function optionalQuery<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" || val === undefined ? undefined : val), schema.optional());
}

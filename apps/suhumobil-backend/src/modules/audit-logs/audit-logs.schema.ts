import { z } from "zod";
import { optionalQuery } from "../../utils/zod-helpers";

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: optionalQuery(z.string()),
  entity: optionalQuery(z.string()),
  userId: optionalQuery(z.string().uuid()),
  dateFrom: optionalQuery(z.coerce.date()),
  dateTo: optionalQuery(z.coerce.date()),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

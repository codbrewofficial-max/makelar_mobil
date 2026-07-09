import type { Request, Response } from "express";
import { listAuditLogs } from "./audit-logs.service";
import { success } from "../../utils/response";

export async function getAuditLogs(req: Request, res: Response) {
  const query = (req as any).validatedQuery;
  const { data, meta } = await listAuditLogs(query);
  res.status(200).json(success(data, "Success", meta));
}

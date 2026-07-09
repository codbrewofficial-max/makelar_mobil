import type { Request, Response } from "express";
import { getDashboardStats } from "./dashboard.service";
import { success } from "../../utils/response";

export async function getStats(_req: Request, res: Response) {
  const stats = await getDashboardStats();
  res.status(200).json(success(stats));
}

import type { Request, Response } from "express";
import { recordVisit, recordClick, getSystemInsights } from "./tracking.service";
import { success } from "../../utils/response";

export async function postVisit(req: Request, res: Response) {
  await recordVisit(req.body);
  res.status(201).json(success(null));
}

export async function postClick(req: Request, res: Response) {
  await recordClick(req.body);
  res.status(201).json(success(null));
}

export async function getInsights(_req: Request, res: Response) {
  const insights = await getSystemInsights();
  res.status(200).json(success(insights));
}

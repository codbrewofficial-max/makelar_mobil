import type { Request, Response } from "express";
import { getPublicSettings, getAdminSettings, updateSettings } from "./settings.service";
import { success } from "../../utils/response";

export async function getSettingsPublic(_req: Request, res: Response) {
  const settings = await getPublicSettings();
  res.status(200).json(success(settings));
}

export async function getSettingsAdmin(_req: Request, res: Response) {
  const settings = await getAdminSettings();
  res.status(200).json(success(settings));
}

export async function putSettingsAdmin(req: Request, res: Response) {
  const settings = await updateSettings(req.body, req.user!.id);
  res.status(200).json(success(settings));
}

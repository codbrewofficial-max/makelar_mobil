import type { Request, Response } from "express";
import {
  listCurators,
  getCuratorById,
  createCurator,
  updateCurator,
  uploadCuratorPhoto,
  deleteCurator,
} from "./curators.service";
import { success, failure } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function getCurators(req: Request, res: Response) {
  const query = (req as any).validatedQuery ?? {};
  const curators = await listCurators(query);
  res.status(200).json(success(curators));
}

export async function getCuratorDetail(req: Request, res: Response) {
  const curator = await getCuratorById(getParam(req, "id"));
  res.status(200).json(success(curator));
}

export async function postCurator(req: Request, res: Response) {
  const curator = await createCurator(req.body, req.user!.id);
  res.status(201).json(success(curator));
}

export async function putCurator(req: Request, res: Response) {
  const curator = await updateCurator(getParam(req, "id"), req.body, req.user!.id);
  res.status(200).json(success(curator));
}

export async function postCuratorPhoto(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File wajib diupload" }));
  }
  const curator = await uploadCuratorPhoto(getParam(req, "id"), req.file.buffer, req.user!.id);
  res.status(200).json(success(curator));
}

export async function removeCurator(req: Request, res: Response) {
  await deleteCurator(getParam(req, "id"), req.user!.id);
  res.status(200).json(success(null));
}

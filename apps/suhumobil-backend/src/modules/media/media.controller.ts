import type { Request, Response } from "express";
import { listMedia, uploadMedia, createMediaLink, deleteMedia } from "./media.service";
import { success, failure } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function getMedia(req: Request, res: Response) {
  const query = (req as any).validatedQuery;
  const { data, meta } = await listMedia(query);
  res.status(200).json(success(data, "Success", meta));
}

export async function postMediaUpload(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File wajib diupload" }));
  }
  const asset = await uploadMedia(req.file, req.user!.id);
  res.status(201).json(success(asset));
}

export async function postMediaLink(req: Request, res: Response) {
  const asset = await createMediaLink(req.body, req.user!.id);
  res.status(201).json(success(asset));
}

export async function removeMedia(req: Request, res: Response) {
  await deleteMedia(getParam(req, "id"), req.user!.id);
  res.status(200).json(success(null));
}

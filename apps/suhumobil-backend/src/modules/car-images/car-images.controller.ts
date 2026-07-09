import type { Request, Response } from "express";
import { uploadCarImage, setCoverImage, reorderCarImages, deleteCarImage } from "./car-images.service";
import { success, failure } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function postCarImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File wajib diupload" }));
  }
  const isCover = req.body.isCover === true || req.body.isCover === "true";
  const image = await uploadCarImage(getParam(req, "id"), req.file, isCover);
  res.status(201).json(success(image));
}

export async function patchCoverImage(req: Request, res: Response) {
  const result = await setCoverImage(getParam(req, "id"), getParam(req, "imageId"));
  res.status(200).json(success(result));
}

export async function putReorderImages(req: Request, res: Response) {
  const result = await reorderCarImages(getParam(req, "id"), req.body);
  res.status(200).json(success(result));
}

export async function removeCarImage(req: Request, res: Response) {
  await deleteCarImage(getParam(req, "id"), getParam(req, "imageId"));
  res.status(200).json(success(null));
}

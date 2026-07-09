import type { Request, Response } from "express";
import { uploadLogo } from "./branding.service";
import { success, failure } from "../../utils/response";

export async function postBrandingLogo(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File wajib diupload" }));
  }
  const result = await uploadLogo(req.file.buffer, req.user!.id);
  res.status(200).json(success(result));
}

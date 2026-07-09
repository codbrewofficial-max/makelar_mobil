import type { Request, Response } from "express";
import { exportBackup, listBackups, restoreBackup } from "./backup.service";
import { success, failure } from "../../utils/response";

export async function postBackupExport(req: Request, res: Response) {
  const result = await exportBackup(req.user!.id);
  res.status(200).json(success(result));
}

export async function getBackupList(req: Request, res: Response) {
  const items = await listBackups();
  res.status(200).json(success(items));
}

export async function postBackupRestore(req: Request, res: Response) {
  if (!req.file) {
    return res.status(422).json(failure("Validation Error", { file: "File dump wajib diupload" }));
  }
  // confirmationText already validated by validateBody(restoreConfirmSchema) middleware
  await restoreBackup(req.file.buffer, req.user!.id);
  res.status(200).json(success(null, "Restore berhasil dilakukan. Semua sesi login telah di-invalidate."));
}

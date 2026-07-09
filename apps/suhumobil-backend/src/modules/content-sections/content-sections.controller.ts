import type { Request, Response } from "express";
import { getPageSections, upsertSection } from "./content-sections.service";
import { success } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function getContentByPage(req: Request, res: Response) {
  const sections = await getPageSections(getParam(req, "page"));
  res.status(200).json(success(sections));
}

export async function putContentSection(req: Request, res: Response) {
  const page = getParam(req, "page");
  const sectionKey = getParam(req, "sectionKey");
  const result = await upsertSection(page, sectionKey, req.body.content, req.user!.id);
  res.status(200).json(success(result));
}

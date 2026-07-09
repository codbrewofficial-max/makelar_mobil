import type { Request, Response } from "express";
import { createLead, listLeads, getLeadById, updateLead } from "./leads.service";
import { success } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function postLead(req: Request, res: Response) {
  const result = await createLead(req.body);
  res.status(201).json(success(result));
}

export async function getAdminLeads(req: Request, res: Response) {
  const query = (req as any).validatedQuery;
  const { data, meta } = await listLeads(query);
  res.status(200).json(success(data, "Success", meta));
}

export async function getAdminLeadDetail(req: Request, res: Response) {
  const lead = await getLeadById(getParam(req, "id"));
  res.status(200).json(success(lead));
}

export async function patchAdminLead(req: Request, res: Response) {
  const result = await updateLead(getParam(req, "id"), req.body, req.user!.id);
  res.status(200).json(success(result));
}

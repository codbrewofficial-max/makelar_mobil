import { prisma } from "../../lib/prisma";
import { AppError } from "../../types";
import { sendTelegramNotification } from "../../lib/telegram";
import { recordLeadConversion } from "../tracking/tracking.service";
import { logger } from "../../lib/logger";
import type { CreateLeadInput, UpdateLeadInput, ListLeadsQuery } from "./leads.schema";

function serializeLead(lead: any) {
  return {
    ...lead,
    budget: lead.budget !== null && lead.budget !== undefined ? Number(lead.budget) : null,
  };
}

function buildTelegramMessage(lead: any, carTitle?: string | null): string {
  const lines = [
    "🔔 *Lead Baru*",
    `Nama: ${lead.name}`,
    `Telepon: ${lead.phone}`,
    `Sumber: ${lead.source}`,
  ];
  if (carTitle) lines.push(`Mobil: ${carTitle}`);
  if (lead.subject) lines.push(`Subjek: ${lead.subject}`);
  if (lead.message) lines.push(`Pesan: ${lead.message}`);
  return lines.join("\n");
}

export async function createLead(input: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone,
      city: input.city ?? null,
      budget: input.budget !== undefined && input.budget !== null ? BigInt(Math.round(input.budget)) : null,
      carInterest: input.carInterest ?? null,
      subject: input.subject ?? null,
      message: input.message ?? null,
      carId: input.carId ?? null,
      source: input.source,
      status: "NEW",
    },
  });

  // Fire-and-forget Telegram notification - never blocks or fails the response.
  let carTitle: string | null = null;
  if (lead.carId) {
    const car = await prisma.car.findUnique({ where: { id: lead.carId } });
    carTitle = car?.title ?? null;
  }
  void sendTelegramNotification(buildTelegramMessage(lead, carTitle)).catch((err) =>
    logger.error({ err }, "Failed to send lead Telegram notification")
  );

  // Conversion tracking: only when the visitor arrived via a referral link (landingSource
  // is optional - most leads won't have one). Never fails the response either.
  // See 07-frontend-reconciliation-addendum.md Section 7 / 08-instruksi Section 4.
  if (input.landingSource) {
    void recordLeadConversion({
      source: input.landingSource,
      carId: lead.carId,
      carTitle,
      leadId: lead.id,
    });
  }

  logger.info({ action: "LEAD_CREATED", leadId: lead.id, source: lead.source });

  return { id: lead.id, status: lead.status };
}

export async function listLeads(query: ListLeadsQuery) {
  const { page, limit, status, source, search } = query;
  const where: any = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    data: items.map(serializeLead),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new AppError(404, "LEAD_NOT_FOUND", "Lead tidak ditemukan");
  return serializeLead(lead);
}

export async function updateLead(id: string, input: UpdateLeadInput, userId: string) {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "LEAD_NOT_FOUND", "Lead tidak ditemukan");

  // Only status and notes may be changed here - visitor-submitted fields stay authentic.
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });

  logger.info({ action: "LEAD_STATUS_UPDATED", userId, leadId: id, status: lead.status });
  return { id: lead.id, status: lead.status };
}

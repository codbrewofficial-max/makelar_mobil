import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import type { TrackEventInput } from "./tracking.schema";
import type { TrackingLogType } from "@prisma/client";

const STANDARD_CHANNELS = ["whatsapp", "instagram", "tiktok", "facebook", "telegram", "custom"];

async function recordEvent(type: TrackingLogType, input: TrackEventInput) {
  const source = input.source.trim().toLowerCase();
  let carTitle: string | null = null;
  let carId: string | null = input.carId ?? null;

  if (carId) {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (car) {
      carTitle = car.title;
    } else {
      // Car not found - the log is still saved, just without a car reference.
      carId = null;
    }
  }

  await prisma.trackingLog.create({ data: { type, source, carId, carTitle } });
}

export async function recordVisit(input: TrackEventInput) {
  await recordEvent("VISIT", input);
}

export async function recordClick(input: TrackEventInput) {
  await recordEvent("CLICK", input);
}

/**
 * Fire-and-forget conversion log, invoked from leads.service.ts right after a lead
 * is created. Mirrors the Telegram-notification pattern: never throws to the caller.
 */
export async function recordLeadConversion(params: {
  source: string;
  carId?: string | null;
  carTitle?: string | null;
  leadId: string;
}) {
  try {
    await prisma.trackingLog.create({
      data: {
        type: "LEAD",
        source: params.source.trim().toLowerCase(),
        carId: params.carId ?? null,
        carTitle: params.carTitle ?? null,
        leadId: params.leadId,
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to record lead conversion tracking log");
  }
}

export async function getSystemInsights() {
  const [totalVisits, totalClicks, totalLeads, sourceGroups, carGroups, recentLogsRaw] = await Promise.all([
    prisma.trackingLog.count({ where: { type: "VISIT" } }),
    prisma.trackingLog.count({ where: { type: "CLICK" } }),
    prisma.trackingLog.count({ where: { type: "LEAD" } }),
    prisma.trackingLog.groupBy({ by: ["source", "type"], _count: { _all: true } }),
    prisma.trackingLog.groupBy({
      by: ["carId", "type"],
      where: { carId: { not: null }, type: { in: ["VISIT", "CLICK"] } },
      _count: { _all: true },
    }),
    prisma.trackingLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  // --- bySource pivot: always include the 6 standard channels, plus any extra ones seen. ---
  const bySourceMap = new Map<string, { source: string; visits: number; clicks: number; leads: number }>();
  for (const channel of STANDARD_CHANNELS) {
    bySourceMap.set(channel, { source: channel, visits: 0, clicks: 0, leads: 0 });
  }
  for (const row of sourceGroups) {
    if (!bySourceMap.has(row.source)) {
      bySourceMap.set(row.source, { source: row.source, visits: 0, clicks: 0, leads: 0 });
    }
    const entry = bySourceMap.get(row.source)!;
    const count = row._count._all;
    if (row.type === "VISIT") entry.visits += count;
    else if (row.type === "CLICK") entry.clicks += count;
    else if (row.type === "LEAD") entry.leads += count;
  }
  const bySource = Array.from(bySourceMap.values());

  // --- byCar: sum visits+clicks per car, take top 10, use latest carTitle snapshot. ---
  const carStatsMap = new Map<string, { visits: number; clicks: number }>();
  for (const row of carGroups) {
    const carId = row.carId as string;
    if (!carStatsMap.has(carId)) carStatsMap.set(carId, { visits: 0, clicks: 0 });
    const entry = carStatsMap.get(carId)!;
    if (row.type === "VISIT") entry.visits += row._count._all;
    else if (row.type === "CLICK") entry.clicks += row._count._all;
  }

  const topCarIds = Array.from(carStatsMap.entries())
    .sort((a, b) => b[1].visits + b[1].clicks - (a[1].visits + a[1].clicks))
    .slice(0, 10)
    .map(([carId]) => carId);

  const byCar = [];
  for (const carId of topCarIds) {
    const latestLog = await prisma.trackingLog.findFirst({
      where: { carId },
      orderBy: { createdAt: "desc" },
    });
    const stats = carStatsMap.get(carId)!;
    byCar.push({
      carId,
      carTitle: latestLog?.carTitle ?? null,
      visits: stats.visits,
      clicks: stats.clicks,
    });
  }

  const recentLogs = recentLogsRaw.map((log) => ({
    id: log.id,
    type: log.type.toLowerCase(),
    source: log.source,
    carId: log.carId,
    carTitle: log.carTitle,
    timestamp: log.createdAt,
  }));

  return { totalVisits, totalClicks, totalLeads, bySource, byCar, recentLogs };
}

import "server-only";
import { db } from "@/lib/db";
import { DEFAULT_COMMISSION_BPS } from "@/lib/constants";

export const SETTING_KEYS = {
  commissionBps: "commission_bps",
  // Tasas para MOSTRAR precios convertidos: micros de unidad menor destino por unidad menor origen.
  fx: (from: string, to: string) => `fx_${from}_${to}`,
} as const;

export async function getSetting(key: string): Promise<string | null> {
  return (await db.setting.findUnique({ where: { key } }))?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function getCommissionBps(categoryId?: string): Promise<number> {
  if (categoryId) {
    const cat = await db.category.findUnique({ where: { id: categoryId }, select: { commissionBps: true } });
    if (cat?.commissionBps != null) return cat.commissionBps;
  }
  const v = await getSetting(SETTING_KEYS.commissionBps);
  const n = v ? Number(v) : NaN;
  return Number.isInteger(n) ? n : DEFAULT_COMMISSION_BPS;
}

export async function getFxRates(): Promise<Record<string, number>> {
  const rows = await db.setting.findMany({ where: { key: { startsWith: "fx_" } } });
  return Object.fromEntries(rows.map((r) => [r.key, Number(r.value)]));
}

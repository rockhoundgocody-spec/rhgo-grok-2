import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MINERALS, mineralById } from "@/lib/minerals";

export type WorldScan = {
  id: string;
  mineralId: string;
  at: string;
};

export type WorldFlow = {
  scans: WorldScan[];
  rate24h: number;
};

const FEATURED = [
  "amethyst",
  "pyrite",
  "malachite",
  "rose-quartz",
  "hematite",
  "fluorite",
  "copper",
  "ls-agate",
  "quartz",
  "gold",
  "turquoise",
  "emerald",
  "azurite",
  "opal",
  "garnet",
  "vanadinite",
];

const SEED_IDS = [...new Set([...FEATURED, ...MINERALS.filter((_, i) => i % 2 === 0).map((m) => m.id)])].slice(0, 36);

export const listWorldScans = createServerFn({ method: "GET" }).handler(async (): Promise<WorldFlow> => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();

  const existing = await sql<{ n: number }>`select count(*)::int as n from world_scans`;
  if ((existing[0]?.n ?? 0) < SEED_IDS.length) {
    for (const id of SEED_IDS) {
      await sql`
        insert into world_scans (id, mineral_id)
        values (${`seed-${id}`}, ${id})
        on conflict (id) do nothing
      `;
    }
  }

  const rows = await sql<{ id: string; mineral_id: string; created_at: string | Date }>`
    select id, mineral_id, created_at
    from world_scans
    order by created_at desc
    limit 96
  `;
  const counted = await sql<{ n: number }>`
    select count(*)::int as n
    from world_scans
    where created_at > now() - interval '24 hours'
  `;

  return {
    scans: rows.map((r) => ({
      id: r.id,
      mineralId: r.mineral_id,
      at: typeof r.created_at === "string" ? r.created_at : r.created_at.toISOString(),
    })),
    rate24h: counted[0]?.n ?? rows.length,
  };
});

export const recordWorldScan = createServerFn({ method: "POST" })
  .validator(z.object({ mineralId: z.string().min(1).max(80) }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!mineralById(data.mineralId)) return { ok: false };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await sql`
      insert into world_scans (id, mineral_id)
      values (${id}, ${data.mineralId})
    `;
    return { ok: true };
  });

import { r as mineralById, t as MINERALS } from "./minerals-D9WKu1dv.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/world-scans-rZEdhSFl.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SEED_IDS = [.../* @__PURE__ */ new Set([...[
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
	"vanadinite"
], ...MINERALS.filter((_, i) => i % 2 === 0).map((m) => m.id)])].slice(0, 36);
var listWorldScans_createServerFn_handler = createServerRpc({
	id: "d083a34e4e03c2a374e48007517c255aa87b6cf2cdf13728b846bf4c738b4110",
	name: "listWorldScans",
	filename: "src/lib/world-scans.ts"
}, (opts) => listWorldScans.__executeServer(opts));
var listWorldScans = createServerFn({ method: "GET" }).handler(listWorldScans_createServerFn_handler, async () => {
	const { getSql } = await import("./db-C--KBsJ_.mjs");
	const sql = await getSql();
	if (((await sql`select count(*)::int as n from world_scans`)[0]?.n ?? 0) < SEED_IDS.length) for (const id of SEED_IDS) await sql`
        insert into world_scans (id, mineral_id)
        values (${`seed-${id}`}, ${id})
        on conflict (id) do nothing
      `;
	const rows = await sql`
    select id, mineral_id, created_at
    from world_scans
    order by created_at desc
    limit 96
  `;
	const counted = await sql`
    select count(*)::int as n
    from world_scans
    where created_at > now() - interval '24 hours'
  `;
	return {
		scans: rows.map((r) => ({
			id: r.id,
			mineralId: r.mineral_id,
			at: typeof r.created_at === "string" ? r.created_at : r.created_at.toISOString()
		})),
		rate24h: counted[0]?.n ?? rows.length
	};
});
var recordWorldScan_createServerFn_handler = createServerRpc({
	id: "633467194324f7c94bbc947e3f6dccc82a15291f62c3843b221475582cd1259e",
	name: "recordWorldScan",
	filename: "src/lib/world-scans.ts"
}, (opts) => recordWorldScan.__executeServer(opts));
var recordWorldScan = createServerFn({ method: "POST" }).validator(object({ mineralId: string().min(1).max(80) })).handler(recordWorldScan_createServerFn_handler, async ({ data }) => {
	if (!mineralById(data.mineralId)) return { ok: false };
	const { getSql } = await import("./db-C--KBsJ_.mjs");
	await (await getSql())`
      insert into world_scans (id, mineral_id)
      values (${`scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`}, ${data.mineralId})
    `;
	return { ok: true };
});
//#endregion
export { listWorldScans_createServerFn_handler, recordWorldScan_createServerFn_handler };

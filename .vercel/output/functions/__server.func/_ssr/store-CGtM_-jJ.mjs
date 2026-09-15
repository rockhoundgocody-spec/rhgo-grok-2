import { r as mineralById } from "./minerals-D9WKu1dv.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CGtM_-jJ.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
function formatInt(n) {
	return Math.round(n).toLocaleString("en-US");
}
function dayKey(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterdayKey(d = /* @__PURE__ */ new Date()) {
	return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
}
function yieldToMain() {
	return new Promise((resolve) => {
		if (typeof scheduler !== "undefined" && "yield" in scheduler) {
			scheduler.yield().then(() => resolve());
			return;
		}
		setTimeout(resolve, 0);
	});
}
function Glass({ children, className, variant = "amethyst" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(variant === "hud" ? "hud" : "glass", "relative overflow-hidden rounded-[22px]", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-50 mix-blend-screen",
				style: { background: variant === "hud" ? "radial-gradient(120% 80% at 50% -20%, hsla(195,100%,70%,0.22) 0%, transparent 62%)" : "radial-gradient(120% 80% at 38% -18%, hsla(280,100%,82%,0.20) 0%, transparent 62%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative",
				children
			})
		]
	});
}
function HudCorners({ inset = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0",
		"aria-hidden": true,
		style: {
			top: inset,
			left: inset,
			right: inset,
			bottom: inset
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hud-corner",
				style: {
					top: 10,
					left: 10
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hud-corner rotate-90",
				style: {
					top: 10,
					right: 10
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hud-corner rotate-180",
				style: {
					bottom: 10,
					right: 10
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hud-corner -rotate-90",
				style: {
					bottom: 10,
					left: 10
				}
			})
		]
	});
}
var BADGE_CATALOG = [
	{
		id: "first-scan",
		name: "First Contact",
		detail: "Log a specimen."
	},
	{
		id: "streak-3",
		name: "Three Suns",
		detail: "Check in three days running."
	},
	{
		id: "streak-7",
		name: "Week in the Field",
		detail: "Seven-day streak."
	},
	{
		id: "ten-finds",
		name: "Ten in the Dex",
		detail: "Ten logged finds."
	},
	{
		id: "five-species",
		name: "Range Finder",
		detail: "Five distinct species."
	},
	{
		id: "rare-find",
		name: "Uncommon Ground",
		detail: "Log a rare or legendary."
	},
	{
		id: "bench-hand",
		name: "Bench Hand",
		detail: "Hardness and streak on one find."
	},
	{
		id: "atlas-reader",
		name: "Atlas Reader",
		detail: "Open ten mineral dossiers."
	},
	{
		id: "engine",
		name: "Engine Room",
		detail: "Run a bench trial."
	},
	{
		id: "steward",
		name: "Steward",
		detail: "Open a protected site and leave it."
	}
];
function evaluateBadges(input) {
	const have = new Set(input.existing);
	const real = input.finds;
	if (real.length >= 1) have.add("first-scan");
	if (input.player.streak >= 3) have.add("streak-3");
	if (input.player.streak >= 7) have.add("streak-7");
	if (real.length >= 10) have.add("ten-finds");
	if (new Set(real.map((f) => f.mineralId)).size >= 5) have.add("five-species");
	if (real.some((f) => {
		const r = mineralById(f.mineralId)?.rarity;
		return r === "rare" || r === "legendary";
	})) have.add("rare-find");
	if (real.some((f) => f.tests.includes("hardness") && f.tests.includes("streak"))) have.add("bench-hand");
	if (input.viewed.length >= 10) have.add("atlas-reader");
	return BADGE_CATALOG.map((b) => b.id).filter((id) => have.has(id));
}
function grant(id, existing) {
	return existing.includes(id) ? existing : [...existing, id];
}
var INITIAL_PLAYER = {
	name: "Field",
	xp: 0,
	streak: 0,
	lastCheckIn: null,
	scans: 0,
	createdAt: (/* @__PURE__ */ new Date()).toISOString()
};
function awardXp(mineral, confidence, tests) {
	const base = mineral?.xp ?? 10;
	const conf = .7 + confidence * .5;
	const lab = 1 + Math.min(3, tests.length) * .08;
	return Math.round(base * conf * lab);
}
var useEngine = create()(persist((set, get) => ({
	player: INITIAL_PLAYER,
	finds: [],
	badges: [],
	viewed: [],
	hydrated: false,
	checkIn: () => {
		const today = dayKey();
		const p = get().player;
		if (p.lastCheckIn === today) return null;
		const streak = p.lastCheckIn === yesterdayKey() ? p.streak + 1 : 1;
		const gained = 25 + Math.min(20, streak * 2);
		set({ player: {
			...p,
			streak,
			lastCheckIn: today,
			xp: p.xp + gained
		} });
		refreshBadges(set, get);
		return {
			gained,
			streak
		};
	},
	grantXp: (n) => {
		const p = get().player;
		set({ player: {
			...p,
			xp: p.xp + Math.max(0, Math.round(n))
		} });
	},
	addFind: (input) => {
		const mineral = mineralById(input.mineralId);
		const find = {
			id: input.id ?? uid("find"),
			mineralId: input.mineralId,
			name: input.name,
			formula: input.formula,
			confidence: input.confidence,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			day: dayKey(),
			lat: input.lat,
			lng: input.lng,
			source: input.source,
			tests: input.tests,
			notes: input.notes,
			ephemeral: input.ephemeral
		};
		const xp = input.ephemeral ? 0 : awardXp(mineral, input.confidence, input.tests);
		const p = get().player;
		set({
			finds: [find, ...get().finds],
			player: {
				...p,
				xp: p.xp + xp,
				scans: p.scans + (input.ephemeral ? 0 : 1)
			}
		});
		if (!input.ephemeral) refreshBadges(set, get);
		return find;
	},
	viewMineral: (id) => {
		const viewed = get().viewed;
		if (viewed.includes(id)) return;
		set({ viewed: [...viewed, id] });
		refreshBadges(set, get);
	},
	seedStress: (n) => {
		const catalog = mineralById;
		const batch = new Array(n);
		const now = Date.now();
		for (let i = 0; i < n; i++) {
			i % 57;
			const ids = [
				"quartz",
				"amethyst",
				"pyrite",
				"calcite",
				"fluorite",
				"malachite",
				"agate",
				"hematite",
				"garnet",
				"obsidian"
			];
			const mid = ids[i % ids.length];
			const m = catalog(mid);
			batch[i] = {
				id: `stress_${now}_${i}`,
				mineralId: mid,
				name: m?.name ?? mid,
				formula: m?.formula ?? "",
				confidence: .5 + i * 17 % 50 / 100,
				at: (/* @__PURE__ */ new Date(now - i * 1e3)).toISOString(),
				day: dayKey(),
				source: "bench",
				tests: [],
				notes: "",
				ephemeral: true
			};
		}
		set({ finds: [...batch, ...get().finds.filter((f) => !f.ephemeral)] });
	},
	clearStress: () => {
		set({ finds: get().finds.filter((f) => !f.ephemeral) });
	},
	resetAll: () => {
		set({
			player: {
				...INITIAL_PLAYER,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			},
			finds: [],
			badges: [],
			viewed: []
		});
	}
}), {
	name: "rhgo.field-engine.v1",
	partialize: (s) => ({
		player: s.player,
		finds: s.finds.filter((f) => !f.ephemeral).slice(0, 240),
		badges: s.badges,
		viewed: s.viewed.slice(0, 200)
	}),
	onRehydrateStorage: () => (state) => {
		if (state) state.hydrated = true;
	}
}));
function refreshBadges(set, get) {
	const s = get();
	const next = evaluateBadges({
		finds: s.finds.filter((f) => !f.ephemeral),
		player: s.player,
		viewed: s.viewed,
		existing: s.badges
	});
	if (next.length !== s.badges.length) set({ badges: next });
}
//#endregion
export { dayKey as a, useEngine as c, cn as i, yieldToMain as l, Glass as n, formatInt as o, HudCorners as r, grant as s, BADGE_CATALOG as t };

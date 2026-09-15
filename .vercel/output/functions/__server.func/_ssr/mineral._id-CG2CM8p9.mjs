import { o as __toESM } from "../_runtime.mjs";
import { r as mineralById } from "./minerals-D9WKu1dv.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-DthKswyC.mjs";
import { c as useEngine, i as cn, n as Glass } from "./store-CGtM_-jJ.mjs";
import { n as LAND_LABEL, t as HOTSPOTS } from "./hotspots-C10k2nuG.mjs";
import { n as Specimen, o as rarityTone } from "./specimen-BAKu1rCm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mineral._id-CG2CM8p9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MineralPage() {
	const { id } = Route.useParams();
	const m = mineralById(id);
	const viewMineral = useEngine((s) => s.viewMineral);
	(0, import_react.useEffect)(() => {
		if (m) viewMineral(m.id);
	}, [m, viewMineral]);
	if (!m) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-5 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Unknown taxon."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/dex",
			className: "mt-4 inline-block text-hud",
			children: "Back to Geo-DEX"
		})]
	});
	const sites = HOTSPOTS.filter((h) => h.minerals.includes(m.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-full max-w-lg px-5 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: { paddingTop: "max(16px, env(safe-area-inset-top))" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dex",
					className: "inline-flex h-11 items-center gap-2 text-[13px] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						size: 16,
						"aria-hidden": true
					}), "Geo-DEX"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
						mineral: m,
						size: 168
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("kicker mt-5", rarityTone(m.rarity)),
				children: [
					m.group,
					" · ",
					m.rarity
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display mt-1 text-[40px] leading-none text-fg",
				children: m.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[13px] text-muted",
				children: m.formula
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "System",
						v: m.system
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Mohs",
						v: m.mohs[0] === m.mohs[1] ? String(m.mohs[0]) : `${m.mohs[0]}–${m.mohs[1]}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "SG",
						v: m.sg[0] === m.sg[1] ? String(m.sg[0]) : `${m.sg[0]}–${m.sg[1]}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Streak",
						v: m.streak
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Luster",
						v: m.luster
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Magnet",
						v: m.magnetism
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-[14px] leading-relaxed text-fg",
				children: m.notes
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[13px] text-muted",
				children: m.tests
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: ["Cleavage · ", m.cleavage]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: ["Diaphaneity · ", m.diaphaneity]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "kicker mt-8",
				children: "Localities"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-[13px] text-muted",
				children: m.localities.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l }, l))
			}),
			sites.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "kicker mt-8",
				children: "In the field atlas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-2",
				children: sites.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/field",
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						className: "px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[14px] text-fg",
							children: h.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] text-muted",
							children: [
								h.state,
								" · ",
								LAND_LABEL[h.land]
							]
						})]
					})
				}) }, h.id))
			})] }) : null
		]
	});
}
function Fact({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
		className: "px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 text-[13px] capitalize",
			children: v
		})]
	});
}
//#endregion
export { MineralPage as component };

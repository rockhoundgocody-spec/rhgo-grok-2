import { o as __toESM } from "../_runtime.mjs";
import { i as searchMinerals, r as mineralById } from "./minerals-D9WKu1dv.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as TopBar } from "./router-DthKswyC.mjs";
import { c as useEngine, i as cn, n as Glass } from "./store-CGtM_-jJ.mjs";
import { n as Specimen, o as rarityTone } from "./specimen-BAKu1rCm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dex-BV3-9WtA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VirtualList({ items, rowHeight, overscan = 8, className, render, getKey }) {
	const ref = (0, import_react.useRef)(null);
	const [scroll, setScroll] = (0, import_react.useState)(0);
	const [height, setHeight] = (0, import_react.useState)(640);
	const onScroll = (e) => {
		setScroll(e.currentTarget.scrollTop);
		const h = e.currentTarget.clientHeight;
		if (h && h !== height) setHeight(h);
	};
	const start = Math.max(0, Math.floor(scroll / rowHeight) - overscan);
	const end = Math.min(items.length, Math.ceil((scroll + height) / rowHeight) + overscan);
	const slice = (0, import_react.useMemo)(() => items.slice(start, end), [
		items,
		start,
		end
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		onScroll,
		className,
		style: { contentVisibility: "auto" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				height: items.length * rowHeight,
				position: "relative"
			},
			children: slice.map((item, i) => {
				const index = start + i;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: rowHeight,
						transform: `translateY(${index * rowHeight}px)`,
						contain: "layout paint"
					},
					children: render(item, index)
				}, getKey(item, index));
			})
		})
	});
}
function DexPage() {
	const finds = useEngine((s) => s.finds);
	const [tab, setTab] = (0, import_react.useState)("finds");
	const [q, setQ] = (0, import_react.useState)("");
	const atlas = (0, import_react.useMemo)(() => searchMinerals(q), [q]);
	const filteredFinds = (0, import_react.useMemo)(() => {
		const n = q.trim().toLowerCase();
		if (!n) return finds;
		return finds.filter((f) => f.name.toLowerCase().includes(n) || f.formula.toLowerCase().includes(n));
	}, [finds, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-full min-h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				kicker: "Archive",
				title: "Geo-DEX",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "engine-num text-[11px] text-hud",
					children: tab === "finds" ? filteredFinds.length : atlas.length
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-1 rounded-full bg-black/30 p-1 hairline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "finds",
						onClick: () => setTab("finds"),
						label: "Finds"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "atlas",
						onClick: () => setTab("atlas"),
						label: "Atlas"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Search"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: tab === "finds" ? "Search finds" : "Name, formula, locality",
						className: "glass h-11 w-full rounded-full px-4 text-sm text-fg placeholder:text-faint"
					})]
				})]
			}),
			tab === "finds" ? filteredFinds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-5 pt-8 text-[13px] text-muted",
				children: "Empty. Scan a tray specimen or run the bench — finds persist on this device."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualList, {
				items: filteredFinds,
				rowHeight: 84,
				className: "mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-6",
				getKey: (f) => f.id,
				render: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindRow, { find: f })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualList, {
				items: atlas,
				rowHeight: 80,
				className: "mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-6",
				getKey: (m) => m.id,
				render: (m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mineral/$id",
					params: { id: m.id },
					className: "block h-[76px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						className: "flex h-full items-center gap-3 px-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
								mineral: m,
								size: 48
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-[14px] font-medium",
									children: m.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-[11px] text-muted",
									children: [
										m.formula,
										" · ",
										m.system
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[10px] uppercase tracking-[0.14em]", rarityTone(m.rarity)),
								children: m.rarity
							})
						]
					})
				})
			})
		]
	});
}
function FindRow({ find }) {
	const m = mineralById(find.mineralId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/mineral/$id",
		params: { id: find.mineralId },
		className: "block h-[80px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			className: "flex h-full items-center gap-3 px-3",
			children: [
				m ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
					mineral: m,
					size: 48
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-12 rounded-full bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-[14px] font-medium",
							children: find.name
						}), find.ephemeral ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-[0.12em] text-warn",
							children: "stress"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-[11px] text-muted",
						children: [
							find.formula,
							" · ",
							find.source
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "engine-num text-[12px] text-hud",
					children: Math.round(find.confidence * 100)
				})
			]
		})
	});
}
function TabBtn({ active, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("h-9 rounded-full text-[11px] uppercase tracking-[0.16em] transition-[background-color,color] duration-150", active ? "bg-fg text-bg" : "text-muted"),
		children: label
	});
}
//#endregion
export { DexPage as component };

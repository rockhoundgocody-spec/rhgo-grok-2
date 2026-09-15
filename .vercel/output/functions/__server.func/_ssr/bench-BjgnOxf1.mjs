import { o as __toESM } from "../_runtime.mjs";
import { t as MINERALS } from "./minerals-D9WKu1dv.mjs";
import { n as readHeap, r as summarize } from "./perf-GHYxUAE8.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as TopBar } from "./router-DthKswyC.mjs";
import { c as useEngine, l as yieldToMain, n as Glass, o as formatInt, s as grant } from "./store-CGtM_-jJ.mjs";
import { i as identify, o as syntheticFeatures, t as Button } from "./classifier-Q32QhXof.mjs";
import { t as HOTSPOTS } from "./hotspots-C10k2nuG.mjs";
import { t as SpatialHash } from "./spatial-sD6CgYao.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bench-BjgnOxf1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BenchPage() {
	const fps = useFps();
	const finds = useEngine((s) => s.finds);
	const seedStress = useEngine((s) => s.seedStress);
	const clearStress = useEngine((s) => s.clearStress);
	const badges = useEngine((s) => s.badges);
	const [stats, setStats] = (0, import_react.useState)([]);
	const [running, setRunning] = (0, import_react.useState)(null);
	const [heap, setHeap] = (0, import_react.useState)(readHeap());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setHeap(readHeap()), 1200);
		return () => clearInterval(id);
	}, []);
	const markEngine = () => {
		useEngine.setState({ badges: grant("engine", badges) });
	};
	const runId = async (n) => {
		setRunning(`id-${n}`);
		const samples = new Array(n);
		const t0 = performance.now();
		for (let i = 0; i < n; i++) {
			const s = performance.now();
			identify({ features: syntheticFeatures(i) });
			samples[i] = performance.now() - s;
			if (i % 250 === 0) await yieldToMain();
		}
		const wall = performance.now() - t0;
		setStats((prev) => [summarize(`ID × ${formatInt(n)}`, samples, wall), ...prev].slice(0, 6));
		setRunning(null);
		markEngine();
	};
	const runSpatial = async (n) => {
		setRunning("spatial");
		const extra = Array.from({ length: 4e3 }, (_, i) => ({
			lat: 25 + i % 24,
			lng: -124 + i * 7 % 58,
			id: i
		}));
		const hash = new SpatialHash([...HOTSPOTS, ...extra], 1);
		const samples = [];
		const t0 = performance.now();
		for (let i = 0; i < n; i++) {
			const s = performance.now();
			hash.nearby(39 + i % 8, -105 - i % 12, 1);
			samples.push(performance.now() - s);
			if (i % 1e3 === 0) await yieldToMain();
		}
		setStats((prev) => [summarize(`Spatial × ${formatInt(n)}`, samples, performance.now() - t0), ...prev].slice(0, 6));
		setRunning(null);
		markEngine();
	};
	const runDex = async (n) => {
		setRunning("dex");
		const t0 = performance.now();
		seedStress(n);
		await yieldToMain();
		setStats((prev) => [summarize(`GeoDex inject ${formatInt(n)}`, [performance.now() - t0], performance.now() - t0), ...prev].slice(0, 6));
		setRunning(null);
		markEngine();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-full max-w-lg px-5 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				kicker: "Stress",
				title: "Bench",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "engine-num text-[11px] text-hud glow-hud",
					"aria-label": `Live ${fps} fps`,
					children: [fps, " fps"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] leading-relaxed text-muted",
				children: "Stress the on-device atlas. ID, spatial hash, and Geo-DEX inject run on-thread so you can feel the ceiling."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						k: "Live",
						v: `${fps}`,
						u: "fps"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						k: "Atlas",
						v: String(MINERALS.length),
						u: "taxa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						k: "Dex",
						v: String(finds.length),
						u: "rows"
					})
				]
			}),
			heap ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[11px] text-faint",
				children: [
					"Heap ",
					heap.usedMb.toFixed(1),
					" / ",
					heap.totalMb.toFixed(0),
					" MB"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-[11px] text-faint",
				children: "Heap API not exposed in this browser"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "w-full justify-between",
						disabled: !!running,
						onClick: () => void runId(2e3),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ID throughput" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-muted",
							children: "2,000 ranks"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "w-full justify-between",
						disabled: !!running,
						onClick: () => void runId(1e4),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ID crush" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-muted",
							children: "10,000 ranks"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "w-full justify-between",
						disabled: !!running,
						onClick: () => void runSpatial(8e3),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Spatial hash" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-muted",
							children: "8,000 queries"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "w-full justify-between",
						disabled: !!running,
						onClick: () => void runDex(5e3),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GeoDex inject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-muted",
							children: "5,000 rows"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "w-full justify-between",
						disabled: !!running,
						onClick: () => void runDex(25e3),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GeoDex crush" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-muted",
							children: "25,000 rows"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: clearStress,
						children: "Clear stress rows"
					})
				]
			}),
			running ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-[12px] text-hud",
				role: "status",
				children: [
					"Running ",
					running,
					"…"
				]
			}) : null,
			stats.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "kicker mb-2",
					children: "Results"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: stats.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						className: "px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3 text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "engine-num text-hud",
								children: s.perSec >= 1e3 ? `${(s.perSec / 1e3).toFixed(1)}k/s` : `${Math.round(s.perSec)}/s`
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 font-mono text-[11px] text-muted",
							children: [
								"p50 ",
								s.p50.toFixed(3),
								" ms · p99 ",
								s.p99.toFixed(3),
								" ms · wall ",
								s.ms.toFixed(0),
								" ms"
							]
						})]
					}) }, `${s.name}-${i}`))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "kicker mb-3",
					children: "Autopsy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					className: "overflow-hidden rounded-[20px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-black/30 text-[10px] uppercase tracking-[0.14em] text-faint",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Surface"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "v2.5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Engine"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "text-muted",
							children: ROWS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-fg",
										children: r[0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: r[1]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-hud",
										children: r[2]
									})
								]
							}, r[0]))
						})]
					})
				})]
			})
		]
	});
}
var ROWS = [
	[
		"Boot",
		"Auth + Base44",
		"localStorage"
	],
	[
		"Scan",
		"Upload + cutout + LLM",
		"64px, on-thread"
	],
	[
		"Map",
		"Leaflet + Google",
		"One canvas"
	],
	[
		"List",
		"replaceChildren",
		"Windowed"
	],
	[
		"Orb",
		"Three.js",
		"80-line shader"
	],
	[
		"Motion",
		"Framer tree",
		"CSS transform"
	]
];
function Meter({ k, v, u }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
		className: "px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "kicker",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "engine-num mt-1 text-[18px]",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] text-faint",
				children: u
			})
		]
	});
}
function useFps() {
	const [fps, setFps] = (0, import_react.useState)(60);
	(0, import_react.useEffect)(() => {
		let frames = 0;
		let last = performance.now();
		let id = 0;
		const loop = (t) => {
			frames += 1;
			if (t - last >= 400) {
				setFps(Math.round(frames * 1e3 / (t - last)));
				frames = 0;
				last = t;
			}
			id = requestAnimationFrame(loop);
		};
		id = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(id);
	}, []);
	return fps;
}
//#endregion
export { BenchPage as component };

import { o as __toESM } from "../_runtime.mjs";
import { n as TRAY, r as mineralById } from "./minerals-D9WKu1dv.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ScanLine, n as X, o as RefreshCw, r as Upload } from "../_libs/lucide-react.mjs";
import { r as TopBar } from "./router-DthKswyC.mjs";
import { c as useEngine, i as cn, n as Glass, r as HudCorners } from "./store-CGtM_-jJ.mjs";
import { a as nextTest, i as identify, n as extractFeatures, r as featuresFromBlob, t as Button } from "./classifier-Q32QhXof.mjs";
import { a as paintSpecimen, c as specimenPhoto, n as Specimen, o as rarityTone } from "./specimen-BAKu1rCm.mjs";
import { n as recordWorldScan } from "./world-scans-CGC3fIpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-CBAkGFwd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScanReticle({ state = "idle", className }) {
	const ring = state === "locked" ? "border-good/70" : state === "live" ? "border-hud/70" : "border-white/25";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-[260px] w-full overflow-hidden rounded-[24px] bg-black/55", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-30",
				style: {
					backgroundImage: "linear-gradient(hsla(195,100%,60%,0.09) 1px, transparent 1px), linear-gradient(90deg, hsla(195,100%,60%,0.09) 1px, transparent 1px)",
					backgroundSize: "24px 24px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(circle at 50% 50%, transparent 42%, hsla(250,40%,4%,0.55) 100%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudCorners, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative size-[176px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute inset-0 rounded-full border", ring) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute inset-3 rounded-full border border-dashed animate-spin-slow", state === "locked" ? "border-good/50" : "border-hud/40") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-[44px] rounded-full border border-hud/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-hud/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-hud/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-hud/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-hud/80" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-8 top-0 h-1/2 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-full bg-gradient-to-b from-transparent via-hud/40 to-transparent animate-hud-scan" })
			})
		]
	});
}
function ScanPage() {
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const addFind = useEngine((s) => s.addFind);
	const [stage, setStage] = (0, import_react.useState)("ready");
	const [camError, setCamError] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [ranked, setRanked] = (0, import_react.useState)([]);
	const [obs, setObs] = (0, import_react.useState)({});
	const [ms, setMs] = (0, import_react.useState)(0);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("tray");
	const stopCam = (0, import_react.useCallback)(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
	}, []);
	(0, import_react.useEffect)(() => () => stopCam(), [stopCam]);
	const runFromFeatures = (features) => {
		const next = {
			...obs,
			features
		};
		const t0 = performance.now();
		const r = identify(next);
		setMs(performance.now() - t0);
		setObs(next);
		setRanked(r);
		setStage("result");
		setSaved(false);
	};
	const openCamera = async () => {
		setCamError(null);
		setTab("lens");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 }
				},
				audio: false
			});
			streamRef.current = stream;
			setStage("camera");
			requestAnimationFrame(() => {
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				}
			});
		} catch {
			setCamError("Camera blocked in this frame. Use the tray or upload.");
		}
	};
	const capture = () => {
		const video = videoRef.current;
		if (!video) return;
		const canvas = document.createElement("canvas");
		const w = 512;
		const h = Math.round(video.videoHeight / Math.max(1, video.videoWidth) * w) || 512;
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, w, h);
		setPreview(canvas.toDataURL("image/jpeg", .7));
		stopCam();
		const features = extractFeatures(canvas, 64);
		runFromFeatures(features);
	};
	const onFile = async (file) => {
		setTab("lens");
		const url = URL.createObjectURL(file);
		setPreview(url);
		const features = await featuresFromBlob(file, 64);
		runFromFeatures(features);
	};
	const scanTray = (mineralId) => {
		const m = mineralById(mineralId);
		if (!m) return;
		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#07060e";
		ctx.fillRect(0, 0, 256, 256);
		paintSpecimen(ctx, m, 256, 256);
		setPreview(specimenPhoto(mineralId) ?? canvas.toDataURL("image/png"));
		const features = extractFeatures(canvas, 64);
		setTab("tray");
		runFromFeatures(features);
	};
	const applyTest = (patch) => {
		const next = {
			...obs,
			...patch
		};
		const t0 = performance.now();
		const r = identify(next);
		setMs(performance.now() - t0);
		setObs(next);
		setRanked(r);
	};
	const primary = ranked[0];
	const nxt = nextTest(obs);
	const tests = [
		typeof obs.mohs === "number" ? "hardness" : "",
		obs.streak && obs.streak !== "skip" ? "streak" : "",
		obs.luster && obs.luster !== "skip" ? "luster" : "",
		obs.magnetism && obs.magnetism !== "skip" ? "magnetism" : ""
	].filter(Boolean);
	const save = () => {
		if (!primary) return;
		addFind({
			mineralId: primary.mineral.id,
			name: primary.mineral.name,
			formula: primary.mineral.formula,
			confidence: primary.score,
			source: tab === "bench" ? "bench" : tab === "tray" ? "tray" : "lens",
			tests,
			notes: nxt ? `Next: ${nxt.prompt}` : "Field tests complete"
		});
		recordWorldScan({ data: { mineralId: primary.mineral.id } }).catch(() => {});
		setSaved(true);
	};
	const reset = () => {
		stopCam();
		setStage("ready");
		setRanked([]);
		setObs({});
		setPreview(null);
		setSaved(false);
		setCamError(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-full max-w-lg flex-col pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: "Scan",
				right: stage !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: reset,
					className: "grid size-11 place-items-center text-muted",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				}) : null
			}),
			stage === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanReticle, { state: "idle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-center text-[13px] leading-relaxed text-muted",
						children: "Hold a specimen in the lens, pick a tray stone, or answer the bench. Ranking never leaves the device."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-3 gap-1 rounded-full bg-black/30 p-1 hairline",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeBtn, {
								active: tab === "lens",
								onClick: () => setTab("lens"),
								label: "Lens"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeBtn, {
								active: tab === "tray",
								onClick: () => setTab("tray"),
								label: "Tray"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeBtn, {
								active: tab === "bench",
								onClick: () => setTab("bench"),
								label: "Bench"
							})
						]
					}),
					tab === "lens" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "primary",
								size: "lg",
								className: "w-full",
								onClick: openCamera,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { size: 16 }), " Open camera"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "glass flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-sm text-fg focus-within:ring-2 focus-within:ring-hud/70",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
										size: 16,
										"aria-hidden": true
									}),
									"Upload a frame",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										className: "sr-only",
										onChange: (e) => {
											const f = e.target.files?.[0];
											if (f) onFile(f);
										}
									})
								]
							}),
							camError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] text-warn",
								children: camError
							}) : null
						]
					}) : null,
					tab === "tray" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker mb-3",
							children: "Known specimens"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: TRAY.map((t) => {
								const m = mineralById(t.mineralId);
								if (!m) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => scanTray(t.mineralId),
									className: "glass flex items-center gap-3 rounded-[18px] px-3 py-3 text-left transition-transform duration-150 active:scale-[0.98]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
										mineral: m,
										size: 48
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13px] font-medium",
										children: m.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-muted",
										children: t.label
									})] })]
								}, t.mineralId);
							})
						})]
					}) : null,
					tab === "bench" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-[13px] text-muted",
								children: "No photo. Answer what you can. The atlas re-ranks instantly."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTests, {
								obs,
								onChange: applyTest
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								size: "lg",
								className: "mt-4 w-full",
								onClick: () => {
									setTab("bench");
									const t0 = performance.now();
									const r = identify(obs);
									setMs(performance.now() - t0);
									setRanked(r);
									setStage("result");
									setSaved(false);
								},
								children: "Rank atlas"
							})
						]
					}) : null
				]
			}) : null,
			stage === "camera" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-5 overflow-hidden rounded-[24px] bg-black",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						playsInline: true,
						muted: true,
						className: "aspect-[3/4] w-full object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudCorners, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 grid place-items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative size-[210px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full border border-amethyst/55" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-3 rounded-full border border-dashed border-amethyst/50 animate-spin-slow" })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 flex justify-center pb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: capture,
							"aria-label": "Capture",
							className: "size-16 rounded-full bg-mint shadow-[0_0_40px_-8px_rgba(159,232,208,0.7)] transition-transform duration-150 active:scale-95"
						})
					})
				]
			}) : null,
			stage === "result" && primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mb-5 overflow-hidden rounded-[22px]",
						children: [
							preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: preview,
								alt: "",
								className: "h-44 w-full object-contain bg-black/50"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-36 items-center justify-center bg-black/40",
								children: mineralById(primary.mineral.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
									mineral: primary.mineral,
									size: 96
								}) : null
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudCorners, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "kicker",
								children: "Identified"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "display mt-1 text-[34px] leading-none text-fg",
								children: primary.mineral.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 font-mono text-[12px] text-muted",
								children: [
									primary.mineral.formula,
									" · ",
									primary.mineral.system,
									" · Mohs ",
									primary.mineral.mohs[0],
									primary.mineral.mohs[1] !== primary.mineral.mohs[0] ? `–${primary.mineral.mohs[1]}` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("mt-1 text-[11px] uppercase tracking-[0.16em]", rarityTone(primary.mineral.rarity)),
								children: primary.mineral.rarity
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "engine-num text-[32px] text-hud glow-hud",
								children: Math.round(primary.score * 100)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "kicker",
								children: "conf"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-[13px] leading-relaxed text-muted",
						children: primary.mineral.notes
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-[11px] text-faint",
						children: [
							ms.toFixed(2),
							" ms · ",
							ranked.length,
							" taxa scored"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-4 space-y-1.5",
						children: ranked.slice(0, 4).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							className: cn("flex items-center justify-between gap-3 px-3 py-2.5", i === 0 && "hud"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("text-[13px]", i === 0 ? "text-fg" : "text-muted"),
								children: [
									i + 1,
									". ",
									r.mineral.name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "engine-num text-[11px] text-faint",
								children: Math.round(r.score * 100)
							})]
						}) }, r.mineral.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "kicker mb-2",
								children: "Field tests"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTests, {
								obs,
								onChange: applyTest
							}),
							nxt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-[12px] text-hud",
								children: ["Next · ", nxt.prompt]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] text-good",
								children: "Tests closed. Confidence is rule-governed."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							size: "lg",
							className: "flex-1",
							onClick: save,
							disabled: saved,
							children: saved ? "Logged to Geo-DEX" : "Save find"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "lg",
							onClick: reset,
							"aria-label": "Scan again",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 })
						})]
					})
				]
			}) : null
		]
	});
}
function ModeBtn({ active, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("h-10 rounded-full text-[11px] uppercase tracking-[0.16em] transition-[background-color,color] duration-150", active ? "bg-fg text-bg" : "text-muted"),
		children: label
	});
}
function FieldTests({ obs, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Hardness",
				children: [
					[2, "nail"],
					[3, "penny"],
					[5, "knife"],
					[5.5, "glass"],
					[6.5, "steel"]
				].map(([v, lab]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: obs.mohs === v,
					onClick: () => onChange({ mohs: v }),
					children: lab
				}, lab))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Streak",
				children: [
					"white",
					"red",
					"black",
					"green",
					"yellow"
				].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: obs.streak === v,
					onClick: () => onChange({ streak: v }),
					children: v
				}, v))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Luster",
				children: [
					"metallic",
					"vitreous",
					"waxy",
					"dull",
					"adamantine"
				].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: obs.luster === v,
					onClick: () => onChange({ luster: v }),
					children: v
				}, v))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Magnet",
				children: [
					"none",
					"weak",
					"strong"
				].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: obs.magnetism === v,
					onClick: () => onChange({ magnetism: v }),
					children: v
				}, v))
			})
		]
	});
}
function Row({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "kicker mb-1.5",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children
	})] });
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("h-8 rounded-full px-3 text-[11px] transition-[background-color,color] duration-150", active ? "bg-amethyst text-bg" : "bg-elevated/80 text-muted hairline"),
		children
	});
}
//#endregion
export { ScanPage as component };

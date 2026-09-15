import { o as __toESM } from "../_runtime.mjs";
import { t as prefersReducedMotion } from "./perf-GHYxUAE8.mjs";
import { B as require_react, _ as createRootRoute, b as require_jsx_runtime, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { a as ScanLine, c as House, i as TriangleAlert, l as Gem, s as Map$1, u as Gauge } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DthKswyC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var RINGS = [
	{
		size: 220,
		top: "-8%",
		left: "-18%",
		dur: 32,
		delay: "0s",
		drift: 22,
		hue: 272
	},
	{
		size: 150,
		top: "58%",
		left: "72%",
		dur: 38,
		delay: "5s",
		drift: 16,
		hue: 188
	},
	{
		size: 280,
		top: "28%",
		left: "48%",
		dur: 46,
		delay: "9s",
		drift: 26,
		hue: 328
	},
	{
		size: 96,
		top: "78%",
		left: "6%",
		dur: 28,
		delay: "3s",
		drift: 14,
		hue: 38
	},
	{
		size: 170,
		top: "8%",
		left: "78%",
		dur: 36,
		delay: "7s",
		drift: 18,
		hue: 255
	}
];
function hash(n) {
	const x = Math.sin(n * 127.1) * 43758.5453;
	return x - Math.floor(x);
}
function makeStars(w, h) {
	const n = Math.min(90, Math.floor(w * h / 14e3));
	const out = [];
	for (let i = 0; i < n; i++) out.push({
		x: hash(i + 1.1) * w,
		y: hash(i + 2.7) * h,
		r: .35 + hash(i + 4.3) * 1.25,
		a: .22 + hash(i + 6.9) * .7,
		tw: .35 + hash(i + 8.1) * 1.4,
		ph: hash(i + 9.9) * Math.PI * 2
	});
	return out;
}
function Atmosphere() {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;
		const reduced = prefersReducedMotion();
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		let stars = [];
		let raf = 0;
		let running = true;
		const t0 = performance.now();
		let moveRaf = 0;
		const resize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = makeStars(w, h);
		};
		resize();
		const onMove = (e) => {
			if (reduced) return;
			if (moveRaf) return;
			moveRaf = requestAnimationFrame(() => {
				moveRaf = 0;
				const x = (e.clientX / window.innerWidth - .5) * 2;
				const y = (e.clientY / window.innerHeight - .5) * 2;
				wrap.style.setProperty("--parallax-x", `${x * 12}px`);
				wrap.style.setProperty("--parallax-y", `${y * 10}px`);
			});
		};
		const frame = (now) => {
			if (!running) return;
			const w = window.innerWidth;
			const h = window.innerHeight;
			ctx.clearRect(0, 0, w, h);
			const t = (now - t0) / 1e3;
			for (const s of stars) {
				const tw = reduced ? s.a : s.a * (.5 + .5 * Math.sin(t * s.tw + s.ph));
				ctx.beginPath();
				ctx.fillStyle = `rgba(236,242,255,${tw})`;
				ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
				ctx.fill();
				if (s.r > 1.25) {
					ctx.fillStyle = `rgba(200,220,255,${tw * .22})`;
					ctx.fillRect(s.x - 4.2, s.y - .3, 8.4, .6);
					ctx.fillRect(s.x - .3, s.y - 4.2, .6, 8.4);
				}
			}
			if (!reduced) raf = requestAnimationFrame(frame);
		};
		const onVis = () => {
			running = !document.hidden;
			if (running && !reduced) {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(frame);
			}
		};
		window.addEventListener("resize", resize, { passive: true });
		window.addEventListener("pointermove", onMove, { passive: true });
		document.addEventListener("visibilitychange", onVis);
		raf = requestAnimationFrame(frame);
		if (reduced) frame(t0);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			if (moveRaf) cancelAnimationFrame(moveRaf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "atmosphere",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/atmosphere/sky.jpg",
				alt: "",
				className: "atmosphere-sky",
				draggable: false
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "atmosphere-stars"
			}),
			RINGS.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "geo-ring",
				style: {
					width: r.size,
					height: r.size,
					top: r.top,
					left: r.left,
					animationDuration: `${r.dur}s`,
					animationDelay: r.delay,
					["--drift"]: `${r.drift}px`,
					background: `radial-gradient(circle, transparent 36%, hsla(${r.hue},95%,78%,0.55) 41%, hsla(${r.hue},90%,60%,0.28) 47%, transparent 58%)`
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "geo-ring-shimmer",
					style: { background: `conic-gradient(from 0deg, transparent 0deg, hsla(${r.hue},100%,85%,0.22) 30deg, transparent 60deg, hsla(${r.hue},100%,85%,0.22) 120deg, transparent 150deg, hsla(${r.hue},100%,85%,0.22) 240deg, transparent 270deg, hsla(${r.hue},100%,85%,0.22) 330deg, transparent 360deg)` }
				})
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-floor" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" })
		]
	});
}
var TABS = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/field",
		label: "Field",
		icon: Map$1
	},
	{
		to: "/scan",
		label: "Scan",
		icon: ScanLine,
		hero: true
	},
	{
		to: "/dex",
		label: "Geo-DEX",
		icon: Gem
	},
	{
		to: "/bench",
		label: "Bench",
		icon: Gauge
	}
];
function Shell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-dvh flex-col text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain",
				style: { paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" },
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "crystal-nav",
				"aria-label": "Primary",
				children: TABS.map((tab) => {
					const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
					if ("hero" in tab && tab.hero) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "-mt-7 flex flex-col items-center gap-1 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "scan-orbit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: tab.to,
								className: "crystal-scan",
								"aria-label": "Scan",
								"aria-current": active ? "page" : void 0,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {
									size: 24,
									strokeWidth: 1.75
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[8px] font-semibold uppercase tracking-[0.22em]",
							style: { color: active ? "hsla(190,100%,85%,0.9)" : "hsla(255,15%,60%,0.5)" },
							children: "Scan"
						})]
					}, tab.to);
					const Icon = tab.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: tab.to,
						"aria-current": active ? "page" : void 0,
						"aria-label": tab.label,
						className: "crystal-tab",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								size: 19,
								strokeWidth: active ? 2 : 1.6,
								"aria-hidden": true
							}),
							tab.label,
							active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute bottom-1 size-1 rounded-full",
								style: {
									background: "hsl(195,100%,70%)",
									boxShadow: "0 0 8px hsla(195,100%,65%,0.8)"
								}
							}) : null
						]
					}, tab.to);
				})
			})
		]
	});
}
function TopBar({ kicker, title, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-end justify-between gap-3 px-5 pb-3",
		style: { paddingTop: "max(20px, env(safe-area-inset-top))" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kicker mb-1",
			children: kicker
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "display text-[28px] leading-none text-fg",
			children: title
		})] }), right]
	});
}
var styles_default = "/assets/styles-anqQ8tVN.css";
var APP_NAME = "RockHound-GO";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0a0a14"
			},
			{
				name: "description",
				content: "RockHound-GO — field companion for rockhounds. Identify minerals, discover hotspots, and build your Geo-DEX."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: Root
});
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-DZlko_Me.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./bench-BjgnOxf1.mjs");
var Route$4 = createFileRoute("/bench")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./dex-BV3-9WtA.mjs");
var Route$3 = createFileRoute("/dex")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./field-BahTUp71.mjs");
var Route$2 = createFileRoute("/field")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./scan-CBAkGFwd.mjs");
var Route$1 = createFileRoute("/scan")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./mineral._id-CG2CM8p9.mjs");
var Route = createFileRoute("/mineral/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	BenchRoute: Route$4.update({
		id: "/bench",
		path: "/bench",
		getParentRoute: () => Route$6
	}),
	DexRoute: Route$3.update({
		id: "/dex",
		path: "/dex",
		getParentRoute: () => Route$6
	}),
	FieldRoute: Route$2.update({
		id: "/field",
		path: "/field",
		getParentRoute: () => Route$6
	}),
	ScanRoute: Route$1.update({
		id: "/scan",
		path: "/scan",
		getParentRoute: () => Route$6
	}),
	MineralIdRoute: Route.update({
		id: "/mineral/$id",
		path: "/mineral/$id",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route as n, TopBar as r, router_exports as t };

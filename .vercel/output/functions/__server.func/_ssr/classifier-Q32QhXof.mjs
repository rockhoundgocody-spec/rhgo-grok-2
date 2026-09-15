import { o as __toESM } from "../_runtime.mjs";
import { t as MINERALS } from "./minerals-D9WKu1dv.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn } from "./store-CGtM_-jJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classifier-Q32QhXof.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.96] transition-[transform,background-color,opacity,box-shadow] duration-150 ease-out", {
	variants: {
		variant: {
			primary: "bg-mint text-mint-fg rounded-[16px] font-semibold shadow-[0_0_40px_-8px_rgba(159,232,208,0.5)]",
			ghost: "bg-transparent text-fg rounded-[12px] hover:bg-elevated/60",
			outline: "glass text-fg rounded-[14px]",
			subtle: "glass text-fg rounded-[14px]",
			danger: "bg-danger/15 text-danger rounded-[12px]"
		},
		size: {
			sm: "h-9 px-3 text-xs tracking-wide",
			md: "h-11 px-4 text-sm",
			lg: "h-14 px-8 text-sm tracking-[0.16em] uppercase",
			icon: "size-11 rounded-full"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
var TWO_PI = Math.PI * 2;
function hueDist(a, b) {
	const d = Math.abs(a - b) % 360;
	return Math.min(d, 360 - d) / 180;
}
function rgbToHsv(r, g, b) {
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);
	let h = 0;
	if (d > 1e-6) {
		if (max === r) h = (g - b) / d % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	const s = max < 1e-6 ? 0 : d / max;
	return {
		h,
		s,
		v: max
	};
}
function featuresFromImageData(img) {
	const px = img.data;
	const w = img.width;
	const h = img.height;
	const hueBins = /* @__PURE__ */ new Float32Array(12);
	let hueSin = 0;
	let hueCos = 0;
	let sat = 0;
	let val = 0;
	let metallic = 0;
	let edge = 0;
	let n = 0;
	const step = w * h > 8192 ? 2 : 1;
	for (let y = 0; y < h - 1; y += step) for (let x = 0; x < w - 1; x += step) {
		const i = (y * w + x) * 4;
		if (px[i + 3] < 24) continue;
		const r = px[i] / 255;
		const g = px[i + 1] / 255;
		const b = px[i + 2] / 255;
		const hsv = rgbToHsv(r, g, b);
		const lum = .2126 * r + .7152 * g + .0722 * b;
		const iR = (y * w + x + 1) * 4;
		const iD = ((y + 1) * w + x) * 4;
		const lumR = .2126 * (px[iR] / 255) + .7152 * (px[iR + 1] / 255) + .0722 * (px[iR + 2] / 255);
		const lumD = .2126 * (px[iD] / 255) + .7152 * (px[iD + 1] / 255) + .0722 * (px[iD + 2] / 255);
		edge += Math.abs(lum - lumR) + Math.abs(lum - lumD);
		if (hsv.v > .82 && hsv.s < .22) metallic += 1;
		if (hsv.s > .08) {
			const rad = hsv.h * Math.PI / 180;
			hueSin += Math.sin(rad);
			hueCos += Math.cos(rad);
			hueBins[Math.min(11, Math.floor(hsv.h / 30))] += 1;
		}
		sat += hsv.s;
		val += hsv.v;
		n += 1;
	}
	if (n === 0) return {
		hue: 0,
		sat: 0,
		val: .5,
		metallic: 0,
		edge: 0,
		hueBins
	};
	return {
		hue: (Math.atan2(hueSin / n, hueCos / n) + TWO_PI) % TWO_PI * (180 / Math.PI),
		sat: sat / n,
		val: val / n,
		metallic: metallic / n,
		edge: edge / n,
		hueBins
	};
}
function extractFeatures(source, size = 64) {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return {
		hue: 0,
		sat: 0,
		val: .5,
		metallic: 0,
		edge: 0,
		hueBins: /* @__PURE__ */ new Float32Array(12)
	};
	ctx.drawImage(source, 0, 0, size, size);
	return featuresFromImageData(ctx.getImageData(0, 0, size, size));
}
function visualScore(m, f) {
	let bestHue = 1;
	for (const h of m.hues) bestHue = Math.min(bestHue, hueDist(f.hue, h));
	const satErr = Math.abs(f.sat - m.sat);
	const valErr = Math.abs(f.val - m.val);
	const metErr = Math.abs(f.metallic - (m.metallic ? .35 : .02));
	const s = 1 - (bestHue * .46 + satErr * .22 + valErr * .18 + metErr * .14);
	return Math.max(0, Math.min(1, s));
}
function streakMatch(m, streak) {
	if (!streak || streak === "skip") return 0;
	const s = m.streak.toLowerCase();
	if (streak === "white") return s.includes("white") || s === "none" ? .16 : -.12;
	if (streak === "black") return s.includes("black") || s.includes("gray") ? .18 : -.1;
	if (streak === "red") return s.includes("red") || s.includes("cherry") ? .22 : -.1;
	if (streak === "green") return s.includes("green") ? .2 : -.1;
	if (streak === "yellow") return s.includes("yellow") ? .16 : -.08;
	return s.includes("white") ? -.08 : .1;
}
function lusterMatch(m, luster) {
	if (!luster || luster === "skip") return 0;
	if (m.luster === luster) return .14;
	if (m.metallic && luster === "metallic") return .14;
	if (m.metallic && luster !== "metallic" && luster !== "submetallic") return -.12;
	if (!m.metallic && luster === "metallic") return -.12;
	return -.04;
}
function identify(obs, catalog = MINERALS) {
	const ranked = new Array(catalog.length);
	for (let i = 0; i < catalog.length; i++) {
		const m = catalog[i];
		const fired = [];
		let rules = 0;
		const visual = obs.features ? visualScore(m, obs.features) : .28;
		if (obs.features) {
			fired.push({
				id: "R001",
				head: "color_consistent",
				weight: .12,
				description: "Body color vs catalog hues"
			});
			rules += .12 * visual;
		}
		if (obs.luster && obs.luster !== "skip") {
			const w = lusterMatch(m, obs.luster);
			rules += w;
			fired.push({
				id: "R003",
				head: "luster_confirmed",
				weight: w,
				description: `Luster ${obs.luster}`
			});
		}
		if (typeof obs.mohs === "number") {
			const lo = m.mohs[0] - .6;
			const hi = m.mohs[1] + .6;
			const ok = obs.mohs >= lo && obs.mohs <= hi;
			const w = ok ? .18 : -.14;
			rules += w;
			fired.push({
				id: "R004",
				head: "hardness_tested",
				weight: w,
				description: ok ? `Mohs ${obs.mohs} in range` : `Mohs ${obs.mohs} off ${m.mohs[0]}–${m.mohs[1]}`
			});
		}
		if (obs.streak && obs.streak !== "skip") {
			const w = streakMatch(m, obs.streak);
			rules += w;
			fired.push({
				id: "R005",
				head: "streak_tested",
				weight: w,
				description: `Streak ${obs.streak}`
			});
		}
		if (obs.magnetism && obs.magnetism !== "skip") {
			const w = m.magnetism === obs.magnetism || obs.magnetism === "none" && m.magnetism === "none" ? .1 : -.16;
			rules += w;
			fired.push({
				id: "R008",
				head: "magnetism_tested",
				weight: w,
				description: `Magnetism ${obs.magnetism}`
			});
		}
		if (obs.diaphaneity && obs.diaphaneity !== "skip") {
			const w = m.diaphaneity.toLowerCase().includes(obs.diaphaneity) ? .06 : -.04;
			rules += w;
			fired.push({
				id: "R007",
				head: "transparency_reported",
				weight: w,
				description: `Diaphaneity ${obs.diaphaneity}`
			});
		}
		if (!obs.mohs && (!obs.streak || obs.streak === "skip")) {
			rules -= .05;
			fired.push({
				id: "R013",
				head: "no_field_tests",
				weight: -.05,
				description: "Image-only — field tests still open"
			});
		}
		const base = Math.min(visual * .62, .52);
		const score = Math.max(0, Math.min(1, base + rules));
		ranked[i] = {
			mineral: m,
			score,
			visual,
			rules,
			fired
		};
	}
	ranked.sort((a, b) => b.score - a.score);
	return ranked;
}
function nextTest(obs) {
	if (typeof obs.mohs !== "number") return {
		key: "hardness",
		prompt: "Hardness — fingernail, penny, knife, glass, steel"
	};
	if (!obs.streak || obs.streak === "skip") return {
		key: "streak",
		prompt: "Streak on unglazed porcelain"
	};
	if (!obs.luster || obs.luster === "skip") return {
		key: "luster",
		prompt: "Luster — metallic or not"
	};
	if (!obs.magnetism || obs.magnetism === "skip") return {
		key: "magnetism",
		prompt: "Does a magnet take it?"
	};
	return null;
}
function syntheticFeatures(seed) {
	const hue = seed * 47 % 360;
	const sat = .15 + seed * 13 % 70 / 100;
	const val = .2 + seed * 29 % 70 / 100;
	const metallic = seed % 7 === 0 ? .4 : .02;
	const hueBins = /* @__PURE__ */ new Float32Array(12);
	hueBins[Math.min(11, Math.floor(hue / 30))] = 1;
	return {
		hue,
		sat,
		val,
		metallic,
		edge: .08,
		hueBins
	};
}
async function featuresFromBlob(blob, size = 64) {
	const bitmap = await createImageBitmap(blob);
	try {
		return extractFeatures(bitmap, size);
	} finally {
		bitmap.close();
	}
}
//#endregion
export { nextTest as a, identify as i, extractFeatures as n, syntheticFeatures as o, featuresFromBlob as r, Button as t };

import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn } from "./store-CGtM_-jJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/specimen-BAKu1rCm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SPECIMEN_PHOTOS = {
	amethyst: "/specimens/amethyst.jpg",
	pyrite: "/specimens/pyrite.jpg",
	malachite: "/specimens/malachite.jpg",
	"rose-quartz": "/specimens/rose-quartz.jpg",
	hematite: "/specimens/hematite.jpg",
	fluorite: "/specimens/fluorite.jpg",
	copper: "/specimens/copper.jpg",
	"ls-agate": "/specimens/ls-agate.jpg"
};
var SPECIMEN_CHIPS = {
	amethyst: "/specimens/chips/amethyst.png",
	pyrite: "/specimens/chips/pyrite.png",
	malachite: "/specimens/chips/malachite.png",
	"rose-quartz": "/specimens/chips/rose-quartz.png",
	hematite: "/specimens/chips/hematite.png",
	fluorite: "/specimens/chips/fluorite.png",
	copper: "/specimens/chips/copper.png",
	"ls-agate": "/specimens/chips/ls-agate.png",
	quartz: "/specimens/chips/quartz.png",
	gold: "/specimens/chips/gold.png",
	turquoise: "/specimens/chips/turquoise.png",
	emerald: "/specimens/chips/emerald.png",
	azurite: "/specimens/chips/azurite.png",
	opal: "/specimens/chips/opal.png",
	garnet: "/specimens/chips/garnet.png",
	vanadinite: "/specimens/chips/vanadinite.png"
};
function specimenPhoto(id) {
	return SPECIMEN_PHOTOS[id];
}
function specimenChip(id) {
	return SPECIMEN_CHIPS[id];
}
function hsv(h, s, v) {
	const c = v * s;
	const x = c * (1 - Math.abs(h / 60 % 2 - 1));
	const m = v - c;
	let r = 0, g = 0, b = 0;
	if (h < 60) {
		r = c;
		g = x;
	} else if (h < 120) {
		r = x;
		g = c;
	} else if (h < 180) {
		g = c;
		b = x;
	} else if (h < 240) {
		g = x;
		b = c;
	} else if (h < 300) {
		r = x;
		b = c;
	} else {
		r = c;
		b = x;
	}
	return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
}
function paintSpecimen(ctx, mineral, w, h, opts) {
	const hue = mineral.hues[0] ?? 270;
	const s = mineral.sat;
	const v = mineral.val;
	ctx.clearRect(0, 0, w, h);
	if (!opts?.isolated) {
		const bg = ctx.createRadialGradient(w * .5, h * .55, 2, w * .5, h * .55, w * .62);
		bg.addColorStop(0, hsv(hue, Math.min(1, s * .45), .16));
		bg.addColorStop(1, "rgba(6,6,12,0)");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, w, h);
	}
	const cx = w * .5;
	const cy = h * .54;
	const id = mineral.id;
	const banded = id.includes("agate") || id === "malachite";
	const cubic = mineral.system === "cubic" && mineral.metallic;
	const octa = id === "fluorite";
	const nugget = mineral.metallic && !cubic;
	if (banded) for (let i = 8; i >= 0; i--) {
		ctx.beginPath();
		ctx.ellipse(cx, cy, w * (.12 + i * .035), h * (.1 + i * .03), .18, 0, Math.PI * 2);
		ctx.fillStyle = hsv((hue + i * 10) % 360, s, Math.max(.12, v + (i % 2 ? .1 : -.16)));
		ctx.fill();
	}
	else if (cubic) {
		const drawCube = (x, y, a) => {
			ctx.save();
			ctx.translate(x, y);
			ctx.beginPath();
			ctx.moveTo(0, -a * .55);
			ctx.lineTo(a * .7, -a * .15);
			ctx.lineTo(a * .7, a * .5);
			ctx.lineTo(0, a * .85);
			ctx.lineTo(-a * .7, a * .5);
			ctx.lineTo(-a * .7, -a * .15);
			ctx.closePath();
			const g = ctx.createLinearGradient(-a, -a, a, a);
			g.addColorStop(0, hsv(hue, s * .4, Math.min(1, v + .25)));
			g.addColorStop(.45, hsv(hue, s, v));
			g.addColorStop(1, hsv(hue, s, Math.max(.1, v - .28)));
			ctx.fillStyle = g;
			ctx.fill();
			ctx.restore();
		};
		drawCube(cx - w * .08, cy + h * .04, w * .28);
		drawCube(cx + w * .12, cy - h * .06, w * .22);
	} else if (octa) {
		ctx.beginPath();
		ctx.moveTo(cx, cy - h * .34);
		ctx.lineTo(cx + w * .28, cy);
		ctx.lineTo(cx, cy + h * .34);
		ctx.lineTo(cx - w * .28, cy);
		ctx.closePath();
		const g = ctx.createLinearGradient(cx - w * .2, cy - h * .3, cx + w * .2, cy + h * .3);
		g.addColorStop(0, hsv(hue, Math.max(0, s - .1), Math.min(1, v + .22)));
		g.addColorStop(.5, hsv((hue + 40) % 360, s, v));
		g.addColorStop(1, hsv(hue, s, Math.max(.12, v - .25)));
		ctx.fillStyle = g;
		ctx.fill();
	} else if (nugget) {
		ctx.beginPath();
		ctx.moveTo(cx - w * .28, cy);
		ctx.quadraticCurveTo(cx - w * .2, cy - h * .28, cx, cy - h * .22);
		ctx.quadraticCurveTo(cx + w * .3, cy - h * .3, cx + w * .26, cy);
		ctx.quadraticCurveTo(cx + w * .22, cy + h * .28, cx, cy + h * .24);
		ctx.quadraticCurveTo(cx - w * .3, cy + h * .22, cx - w * .28, cy);
		const g = ctx.createRadialGradient(cx - w * .1, cy - h * .1, 2, cx, cy, w * .4);
		g.addColorStop(0, hsv(hue, s * .35, Math.min(1, v + .3)));
		g.addColorStop(1, hsv(hue, s, Math.max(.1, v - .2)));
		ctx.fillStyle = g;
		ctx.fill();
	} else {
		const prism = (x, y, sc, rot) => {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(rot);
			ctx.beginPath();
			ctx.moveTo(0, -h * .4 * sc);
			ctx.lineTo(w * .13 * sc, -h * .18 * sc);
			ctx.lineTo(w * .15 * sc, h * .24 * sc);
			ctx.lineTo(0, h * .36 * sc);
			ctx.lineTo(-w * .15 * sc, h * .24 * sc);
			ctx.lineTo(-w * .13 * sc, -h * .18 * sc);
			ctx.closePath();
			const g = ctx.createLinearGradient(-w * .15 * sc, -h * .4 * sc, w * .15 * sc, h * .3 * sc);
			g.addColorStop(0, hsv(hue, Math.max(0, s - .18), Math.min(1, v + .32)));
			g.addColorStop(.4, hsv(hue, s, v));
			g.addColorStop(1, hsv((hue + 18) % 360, s, Math.max(.1, v - .32)));
			ctx.fillStyle = g;
			ctx.fill();
			ctx.globalAlpha = .45;
			ctx.beginPath();
			ctx.moveTo(0, -h * .4 * sc);
			ctx.lineTo(0, h * .36 * sc);
			ctx.strokeStyle = hsv(hue, s * .3, 1);
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.globalAlpha = 1;
			ctx.restore();
		};
		prism(cx, cy, 1, 0);
		prism(cx - w * .18, cy + h * .08, .62, -.38);
		prism(cx + w * .16, cy + h * .1, .52, .42);
	}
	ctx.globalAlpha = .45;
	ctx.fillStyle = "#fff";
	ctx.beginPath();
	ctx.ellipse(cx - w * .1, cy - h * .16, w * .1, h * .04, -.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 1;
}
function makeJewelCanvas(mineral, size = 128) {
	const c = document.createElement("canvas");
	c.width = size;
	c.height = size;
	const ctx = c.getContext("2d");
	if (!ctx) return c;
	paintSpecimen(ctx, mineral, size, size, { isolated: true });
	return c;
}
/** Die-cut vinyl sticker: cream paper lip around the specimen silhouette. */
function makeStickerCanvas(source, size = 256) {
	const out = document.createElement("canvas");
	out.width = size;
	out.height = size;
	const ctx = out.getContext("2d");
	if (!ctx) return out;
	const pad = Math.round(size * .16);
	const inner = size - pad * 2;
	const lip = Math.max(4, Math.round(size * .048));
	ctx.save();
	ctx.shadowColor = "#f3eee4";
	ctx.shadowBlur = 0;
	const steps = 18;
	for (let i = 0; i < steps; i++) {
		const a = i / steps * Math.PI * 2;
		ctx.shadowOffsetX = Math.cos(a) * lip;
		ctx.shadowOffsetY = Math.sin(a) * lip;
		ctx.drawImage(source, pad, pad, inner, inner);
	}
	ctx.restore();
	ctx.drawImage(source, pad, pad, inner, inner);
	return out;
}
function Specimen({ mineral, size = 48, className }) {
	const src = SPECIMEN_PHOTOS[mineral.id];
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (src) return;
		const c = ref.current;
		if (!c) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		c.width = Math.round(size * dpr);
		c.height = Math.round(size * dpr);
		const ctx = c.getContext("2d");
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		paintSpecimen(ctx, mineral, size, size);
	}, [
		mineral,
		size,
		src
	]);
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		width: size,
		height: size,
		className: cn("specimen-photo shrink-0", className),
		style: {
			width: size,
			height: size
		},
		draggable: false
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		width: size,
		height: size,
		className: cn("shrink-0 rounded-full", className),
		style: {
			width: size,
			height: size
		},
		"aria-hidden": true
	});
}
function rarityTone(rarity) {
	if (rarity === "legendary") return "text-warn";
	if (rarity === "rare") return "text-amethyst";
	if (rarity === "uncommon") return "text-hud";
	return "text-faint";
}
//#endregion
export { paintSpecimen as a, specimenPhoto as c, makeStickerCanvas as i, Specimen as n, rarityTone as o, makeJewelCanvas as r, specimenChip as s, SPECIMEN_CHIPS as t };

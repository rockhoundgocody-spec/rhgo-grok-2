//#region node_modules/.nitro/vite/services/ssr/assets/spatial-sD6CgYao.js
var SpatialHash = class {
	cells = /* @__PURE__ */ new Map();
	cell;
	constructor(items, cell = 1) {
		this.cell = cell;
		for (const item of items) this.insert(item);
	}
	key(lat, lng) {
		const i = Math.floor(lat / this.cell);
		const j = Math.floor(lng / this.cell);
		return (i + 90) * 1e3 + (j + 180);
	}
	insert(item) {
		const k = this.key(item.lat, item.lng);
		const bucket = this.cells.get(k);
		if (bucket) bucket.push(item);
		else this.cells.set(k, [item]);
	}
	nearby(lat, lng, radiusCells = 1) {
		const i0 = Math.floor(lat / this.cell);
		const j0 = Math.floor(lng / this.cell);
		const out = [];
		for (let i = i0 - radiusCells; i <= i0 + radiusCells; i++) for (let j = j0 - radiusCells; j <= j0 + radiusCells; j++) {
			const bucket = this.cells.get((i + 90) * 1e3 + (j + 180));
			if (bucket) out.push(...bucket);
		}
		return out;
	}
	all() {
		const out = [];
		for (const bucket of this.cells.values()) out.push(...bucket);
		return out;
	}
};
function projectConus(lat, lng, w, h, pad = 16) {
	return {
		x: pad + (lng - -125.5) / 59.5 * (w - pad * 2),
		y: pad + (49.5 - lat) / 25.1 * (h - pad * 2)
	};
}
//#endregion
export { projectConus as n, SpatialHash as t };

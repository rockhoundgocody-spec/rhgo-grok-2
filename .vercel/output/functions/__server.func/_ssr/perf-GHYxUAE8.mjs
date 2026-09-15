//#region node_modules/.nitro/vite/services/ssr/assets/perf-GHYxUAE8.js
function percentile(sorted, p) {
	if (sorted.length === 0) return 0;
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p / 100 * sorted.length) - 1))];
}
function summarize(name, samples, wallMs) {
	const sorted = samples.slice().sort((a, b) => a - b);
	const n = samples.length;
	return {
		name,
		n,
		ms: wallMs,
		p50: percentile(sorted, 50),
		p99: percentile(sorted, 99),
		perSec: wallMs > 0 ? n / wallMs * 1e3 : 0
	};
}
function readHeap() {
	const mem = performance.memory;
	if (!mem) return null;
	return {
		usedMb: mem.usedJSHeapSize / 1048576,
		totalMb: mem.jsHeapSizeLimit / 1048576
	};
}
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
export { readHeap as n, summarize as r, prefersReducedMotion as t };

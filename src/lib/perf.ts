export type BenchStat = {
  name: string;
  n: number;
  ms: number;
  p50: number;
  p99: number;
  perSec: number;
};

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[i];
}

export function summarize(name: string, samples: number[], wallMs: number): BenchStat {
  const sorted = samples.slice().sort((a, b) => a - b);
  const n = samples.length;
  return {
    name,
    n,
    ms: wallMs,
    p50: percentile(sorted, 50),
    p99: percentile(sorted, 99),
    perSec: wallMs > 0 ? (n / wallMs) * 1000 : 0,
  };
}

export function readHeap(): { usedMb: number; totalMb: number } | null {
  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  if (!mem) return null;
  return {
    usedMb: mem.usedJSHeapSize / 1048576,
    totalMb: mem.jsHeapSizeLimit / 1048576,
  };
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

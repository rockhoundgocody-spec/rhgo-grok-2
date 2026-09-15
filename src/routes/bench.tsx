import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shell";
import { Glass } from "@/components/glass";
import { identify, syntheticFeatures } from "@/lib/classifier";
import { HOTSPOTS } from "@/lib/hotspots";
import { SpatialHash } from "@/lib/spatial";
import { MINERALS } from "@/lib/minerals";
import { readHeap, summarize, type BenchStat } from "@/lib/perf";
import { useEngine } from "@/lib/store";
import { grant } from "@/lib/badges";
import { formatInt, yieldToMain } from "@/lib/utils";

export const Route = createFileRoute("/bench")({ component: BenchPage });

function BenchPage() {
  const fps = useFps();
  const finds = useEngine((s) => s.finds);
  const seedStress = useEngine((s) => s.seedStress);
  const clearStress = useEngine((s) => s.clearStress);
  const badges = useEngine((s) => s.badges);
  const [stats, setStats] = useState<BenchStat[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [heap, setHeap] = useState(readHeap());

  useEffect(() => {
    const id = setInterval(() => setHeap(readHeap()), 1200);
    return () => clearInterval(id);
  }, []);

  const markEngine = () => {
    useEngine.setState({ badges: grant("engine", badges) });
  };

  const runId = async (n: number) => {
    setRunning(`id-${n}`);
    const samples: number[] = new Array(n);
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

  const runSpatial = async (n: number) => {
    setRunning("spatial");
    const extra = Array.from({ length: 4000 }, (_, i) => ({
      lat: 25 + (i % 24),
      lng: -124 + ((i * 7) % 58),
      id: i,
    }));
    const hash = new SpatialHash([...HOTSPOTS, ...extra], 1);
    const samples: number[] = [];
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      const s = performance.now();
      hash.nearby(39 + (i % 8), -105 - (i % 12), 1);
      samples.push(performance.now() - s);
      if (i % 1000 === 0) await yieldToMain();
    }
    setStats((prev) => [summarize(`Spatial × ${formatInt(n)}`, samples, performance.now() - t0), ...prev].slice(0, 6));
    setRunning(null);
    markEngine();
  };

  const runDex = async (n: number) => {
    setRunning("dex");
    const t0 = performance.now();
    seedStress(n);
    await yieldToMain();
    setStats((prev) =>
      [summarize(`GeoDex inject ${formatInt(n)}`, [performance.now() - t0], performance.now() - t0), ...prev].slice(0, 6),
    );
    setRunning(null);
    markEngine();
  };

  return (
    <main className="mx-auto min-h-full max-w-lg px-5 pb-10">
      <TopBar
        kicker="Stress"
        title="Bench"
        right={
          <span className="engine-num text-[11px] text-hud glow-hud" aria-label={`Live ${fps} fps`}>
            {fps} fps
          </span>
        }
      />

      <p className="text-[13px] leading-relaxed text-muted">
        Stress the on-device atlas. ID, spatial hash, and Geo-DEX inject run on-thread so you can feel the ceiling.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Meter k="Live" v={`${fps}`} u="fps" />
        <Meter k="Atlas" v={String(MINERALS.length)} u="taxa" />
        <Meter k="Dex" v={String(finds.length)} u="rows" />
      </div>
      {heap ? (
        <p className="mt-2 font-mono text-[11px] text-faint">
          Heap {heap.usedMb.toFixed(1)} / {heap.totalMb.toFixed(0)} MB
        </p>
      ) : (
        <p className="mt-2 font-mono text-[11px] text-faint">Heap API not exposed in this browser</p>
      )}

      <div className="mt-6 space-y-2">
        <Button variant="subtle" className="w-full justify-between" disabled={!!running} onClick={() => void runId(2000)}>
          <span>ID throughput</span>
          <span className="engine-num text-[11px] text-muted">2,000 ranks</span>
        </Button>
        <Button variant="subtle" className="w-full justify-between" disabled={!!running} onClick={() => void runId(10000)}>
          <span>ID crush</span>
          <span className="engine-num text-[11px] text-muted">10,000 ranks</span>
        </Button>
        <Button variant="subtle" className="w-full justify-between" disabled={!!running} onClick={() => void runSpatial(8000)}>
          <span>Spatial hash</span>
          <span className="engine-num text-[11px] text-muted">8,000 queries</span>
        </Button>
        <Button variant="subtle" className="w-full justify-between" disabled={!!running} onClick={() => void runDex(5000)}>
          <span>GeoDex inject</span>
          <span className="engine-num text-[11px] text-muted">5,000 rows</span>
        </Button>
        <Button variant="subtle" className="w-full justify-between" disabled={!!running} onClick={() => void runDex(25000)}>
          <span>GeoDex crush</span>
          <span className="engine-num text-[11px] text-muted">25,000 rows</span>
        </Button>
        <Button variant="outline" className="w-full" onClick={clearStress}>
          Clear stress rows
        </Button>
      </div>

      {running ? (
        <p className="mt-4 text-[12px] text-hud" role="status">
          Running {running}…
        </p>
      ) : null}

      {stats.length > 0 ? (
        <section className="mt-6">
          <h2 className="kicker mb-2">Results</h2>
          <ul className="space-y-2">
            {stats.map((s, i) => (
              <li key={`${s.name}-${i}`}>
                <Glass className="px-4 py-3">
                  <div className="flex justify-between gap-3 text-[13px]">
                    <span>{s.name}</span>
                    <span className="engine-num text-hud">
                      {s.perSec >= 1000 ? `${(s.perSec / 1000).toFixed(1)}k/s` : `${Math.round(s.perSec)}/s`}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted">
                    p50 {s.p50.toFixed(3)} ms · p99 {s.p99.toFixed(3)} ms · wall {s.ms.toFixed(0)} ms
                  </div>
                </Glass>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="kicker mb-3">Autopsy</h2>
        <Glass className="overflow-hidden rounded-[20px]">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-black/30 text-[10px] uppercase tracking-[0.14em] text-faint">
              <tr>
                <th className="px-3 py-2 font-medium">Surface</th>
                <th className="px-3 py-2 font-medium">v2.5</th>
                <th className="px-3 py-2 font-medium">Engine</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {ROWS.map((r) => (
                <tr key={r[0]} className="border-t border-line">
                  <td className="px-3 py-2 text-fg">{r[0]}</td>
                  <td className="px-3 py-2">{r[1]}</td>
                  <td className="px-3 py-2 text-hud">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Glass>
      </section>
    </main>
  );
}

const ROWS = [
  ["Boot", "Auth + Base44", "localStorage"],
  ["Scan", "Upload + cutout + LLM", "64px, on-thread"],
  ["Map", "Leaflet + Google", "One canvas"],
  ["List", "replaceChildren", "Windowed"],
  ["Orb", "Three.js", "80-line shader"],
  ["Motion", "Framer tree", "CSS transform"],
] as const;

function Meter({ k, v, u }: { k: string; v: string; u: string }) {
  return (
    <Glass className="px-3 py-3">
      <div className="kicker">{k}</div>
      <div className="engine-num mt-1 text-[18px]">{v}</div>
      <div className="text-[10px] text-faint">{u}</div>
    </Glass>
  );
}

function useFps() {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let id = 0;
    const loop = (t: number) => {
      frames += 1;
      if (t - last >= 400) {
        setFps(Math.round((frames * 1000) / (t - last)));
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

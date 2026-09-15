import { useEffect, useMemo, useRef, useState } from "react";
import { HOTSPOTS, LAND_LABEL, type Hotspot, type LandType } from "@/lib/hotspots";
import { SpatialHash, projectConus } from "@/lib/spatial";
import { cn } from "@/lib/utils";

const LAND_COLOR: Record<LandType, string> = {
  public: "#9fe8d0",
  blm: "#d4a574",
  forest_service: "#8ed9a8",
  state_park: "#7ee0ea",
  fee: "#c4a0ea",
  protected: "#e08a8a",
  private: "#8c8c97",
};

type Props = {
  selected: Hotspot | null;
  onSelect: (h: Hotspot | null) => void;
  filterLand: LandType | "all";
};

export function FieldMap({ selected, onSelect, filterLand }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);

  const hash = useMemo(() => new SpatialHash(HOTSPOTS, 1.5), []);
  const points = filterLand === "all" ? HOTSPOTS : HOTSPOTS.filter((h) => h.land === filterLand);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 8 || h < 8) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);

      const ocean = ctx.createRadialGradient(w * 0.45, h * 0.5, 40, w * 0.5, h * 0.55, Math.max(w, h) * 0.8);
      ocean.addColorStop(0, "rgba(14, 32, 58, 0.72)");
      ocean.addColorStop(0.55, "rgba(8, 14, 28, 0.5)");
      ocean.addColorStop(1, "rgba(4, 5, 12, 0.95)");
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(210,225,255,0.55)";
      for (let i = 0; i < 48; i++) {
        const sx = ((i * 97) % 1000) / 1000 * w;
        const sy = ((i * 53) % 1000) / 1000 * h;
        ctx.globalAlpha = 0.12 + (i % 5) * 0.06;
        ctx.fillRect(sx, sy, i % 7 === 0 ? 1.6 : 0.9, i % 7 === 0 ? 1.6 : 0.9);
      }
      ctx.globalAlpha = 1;

      const wash = ctx.createRadialGradient(w * 0.5, h * 0.18, 8, w * 0.5, h * 0.4, Math.max(w, h) * 0.65);
      wash.addColorStop(0, "rgba(120, 48, 170, 0.22)");
      wash.addColorStop(0.5, "rgba(30, 70, 110, 0.1)");
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.scale, view.scale);

      ctx.strokeStyle = "rgba(126,224,234,0.12)";
      ctx.lineWidth = 1;
      for (let lng = -125; lng <= -65; lng += 5) {
        const a = projectConus(49.5, lng, w, h);
        const b = projectConus(24.4, lng, w, h);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let lat = 25; lat <= 49; lat += 5) {
        const a = projectConus(lat, -125.5, w, h);
        const b = projectConus(lat, -66, w, h);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(212,179,245,0.28)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const corners = [
        [49.0, -124.5],
        [48.5, -123],
        [47.0, -123.2],
        [45.6, -123.9],
        [42.0, -124.4],
        [40.0, -124.0],
        [34.5, -120.5],
        [32.5, -117.1],
        [32.5, -114.5],
        [31.3, -110.0],
        [31.3, -108.2],
        [31.8, -106.5],
        [29.3, -103.0],
        [25.9, -97.4],
        [29.7, -93.8],
        [30.4, -88.0],
        [25.1, -80.5],
        [31.0, -81.3],
        [35.2, -75.5],
        [41.0, -72.0],
        [42.9, -70.6],
        [44.8, -67.0],
        [47.3, -68.3],
        [47.4, -69.8],
        [45.0, -71.5],
        [45.0, -74.3],
        [43.6, -76.5],
        [43.3, -79.0],
        [42.3, -81.2],
        [41.7, -82.7],
        [43.6, -83.9],
        [45.4, -84.8],
        [46.5, -84.5],
        [46.8, -87.5],
        [46.9, -90.4],
        [47.8, -90.4],
        [48.0, -89.5],
        [49.0, -94.5],
        [49.0, -123.0],
      ] as const;
      const trace = () => {
        corners.forEach(([lat, lng], i) => {
          const p = projectConus(lat, lng, w, h);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
      };

      ctx.beginPath();
      trace();
      const land = ctx.createLinearGradient(0, 0, w, h);
      land.addColorStop(0, "rgba(72, 48, 92, 0.5)");
      land.addColorStop(0.45, "rgba(32, 58, 72, 0.42)");
      land.addColorStop(1, "rgba(28, 44, 58, 0.48)");
      ctx.fillStyle = land;
      ctx.fill();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(180, 210, 230, 0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        const y = (h / 18) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + 8);
        ctx.stroke();
      }
      ctx.restore();

      ctx.beginPath();
      trace();
      ctx.strokeStyle = "rgba(180, 220, 255, 0.5)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(126,224,234,0.4)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (const hs of points) {
        const p = projectConus(hs.lat, hs.lng, w, h);
        const active = selected?.id === hs.id;
        const col = LAND_COLOR[hs.land];
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.globalAlpha = hs.land === "protected" ? 0.75 : 1;
        ctx.shadowColor = col;
        ctx.shadowBlur = active ? 22 : 12;
        ctx.arc(p.x, p.y, active ? 7.2 : 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.arc(p.x, p.y, active ? 7.2 : 4.6, 0, Math.PI * 2);
        ctx.stroke();
        if (active) {
          ctx.globalAlpha = 0.22;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(7,6,14,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [view, points, selected, hash]);

  const hit = (clientX: number, clientY: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const x = (clientX - rect.left - view.x) / view.scale;
    const y = (clientY - rect.top - view.y) / view.scale;
    let best: Hotspot | null = null;
    let bestD = 14;
    for (const hs of points) {
      const p = projectConus(hs.lat, hs.lng, wrap.clientWidth, wrap.clientHeight);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = hs;
      }
    }
    return best;
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none overflow-hidden"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        drag.current = { px: e.clientX, py: e.clientY, vx: view.x, vy: view.y };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setView((v) => ({
          ...v,
          x: drag.current!.vx + (e.clientX - drag.current!.px),
          y: drag.current!.vy + (e.clientY - drag.current!.py),
        }));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        if (Math.hypot(e.clientX - d.px, e.clientY - d.py) < 6) {
          onSelect(hit(e.clientX, e.clientY));
        }
      }}
      onWheel={(e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.92 : 1.08;
        setView((v) => ({ ...v, scale: Math.min(4, Math.max(0.7, v.scale * factor)) }));
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function LandChip({
  land,
  active,
  onClick,
}: {
  land: LandType | "all";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 shrink-0 rounded-full px-3 text-[11px] tracking-wide transition-[background-color,color] duration-150",
        active ? "bg-fg text-bg" : "bg-black/30 text-muted hairline",
      )}
    >
      {land === "all" ? "all" : LAND_LABEL[land]}
    </button>
  );
}

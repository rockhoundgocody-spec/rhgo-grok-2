import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/perf";

const RINGS = [
  { size: 220, top: "-8%", left: "-18%", dur: 32, delay: "0s", drift: 22, hue: 272 },
  { size: 150, top: "58%", left: "72%", dur: 38, delay: "5s", drift: 16, hue: 188 },
  { size: 280, top: "28%", left: "48%", dur: 46, delay: "9s", drift: 26, hue: 328 },
  { size: 96, top: "78%", left: "6%", dur: 28, delay: "3s", drift: 14, hue: 38 },
  { size: 170, top: "8%", left: "78%", dur: 36, delay: "7s", drift: 18, hue: 255 },
];

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number };

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function makeStars(w: number, h: number): Star[] {
  const n = Math.min(90, Math.floor((w * h) / 14000));
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: hash(i + 1.1) * w,
      y: hash(i + 2.7) * h,
      r: 0.35 + hash(i + 4.3) * 1.25,
      a: 0.22 + hash(i + 6.9) * 0.7,
      tw: 0.35 + hash(i + 8.1) * 1.4,
      ph: hash(i + 9.9) * Math.PI * 2,
    });
  }
  return out;
}

export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let stars: Star[] = [];
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

    const onMove = (e: PointerEvent) => {
      if (reduced) return;
      if (moveRaf) return;
      moveRaf = requestAnimationFrame(() => {
        moveRaf = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        wrap.style.setProperty("--parallax-x", `${x * 12}px`);
        wrap.style.setProperty("--parallax-y", `${y * 10}px`);
      });
    };

    const frame = (now: number) => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const t = (now - t0) / 1000;
      for (const s of stars) {
        const tw = reduced ? s.a : s.a * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        ctx.beginPath();
        ctx.fillStyle = `rgba(236,242,255,${tw})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.25) {
          ctx.fillStyle = `rgba(200,220,255,${tw * 0.22})`;
          ctx.fillRect(s.x - 4.2, s.y - 0.3, 8.4, 0.6);
          ctx.fillRect(s.x - 0.3, s.y - 4.2, 0.6, 8.4);
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

  return (
    <div ref={wrapRef} className="atmosphere" aria-hidden>
      <img
        src="/atmosphere/sky.jpg"
        alt=""
        className="atmosphere-sky"
        draggable={false}
      />
      <canvas ref={canvasRef} className="atmosphere-stars" />
      {RINGS.map((r, i) => (
        <span
          key={i}
          className="geo-ring"
          style={{
            width: r.size,
            height: r.size,
            top: r.top,
            left: r.left,
            animationDuration: `${r.dur}s`,
            animationDelay: r.delay,
            ["--drift" as string]: `${r.drift}px`,
            background: `radial-gradient(circle, transparent 36%, hsla(${r.hue},95%,78%,0.55) 41%, hsla(${r.hue},90%,60%,0.28) 47%, transparent 58%)`,
          }}
        >
          <span
            className="geo-ring-shimmer"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, hsla(${r.hue},100%,85%,0.22) 30deg, transparent 60deg, hsla(${r.hue},100%,85%,0.22) 120deg, transparent 150deg, hsla(${r.hue},100%,85%,0.22) 240deg, transparent 270deg, hsla(${r.hue},100%,85%,0.22) 330deg, transparent 360deg)`,
            }}
          />
        </span>
      ))}
      <div className="atmosphere-vignette" />
      <div className="atmosphere-floor" />
      <div className="film-grain" />
    </div>
  );
}

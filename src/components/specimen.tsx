import { useEffect, useRef } from "react";
import type { Mineral } from "@/lib/minerals";
import { cn } from "@/lib/utils";

export const SPECIMEN_PHOTOS: Record<string, string> = {
  amethyst: "/specimens/amethyst.jpg",
  pyrite: "/specimens/pyrite.jpg",
  malachite: "/specimens/malachite.jpg",
  "rose-quartz": "/specimens/rose-quartz.jpg",
  hematite: "/specimens/hematite.jpg",
  fluorite: "/specimens/fluorite.jpg",
  copper: "/specimens/copper.jpg",
  "ls-agate": "/specimens/ls-agate.jpg",
};

export const SPECIMEN_CHIPS: Record<string, string> = {
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
  vanadinite: "/specimens/chips/vanadinite.png",
};

export function specimenPhoto(id: string) {
  return SPECIMEN_PHOTOS[id];
}

export function specimenChip(id: string) {
  return SPECIMEN_CHIPS[id];
}

function hsv(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
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

export function paintSpecimen(
  ctx: CanvasRenderingContext2D,
  mineral: Mineral,
  w: number,
  h: number,
  opts?: { isolated?: boolean },
) {
  const hue = mineral.hues[0] ?? 270;
  const s = mineral.sat;
  const v = mineral.val;
  ctx.clearRect(0, 0, w, h);

  if (!opts?.isolated) {
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.55, 2, w * 0.5, h * 0.55, w * 0.62);
    bg.addColorStop(0, hsv(hue, Math.min(1, s * 0.45), 0.16));
    bg.addColorStop(1, "rgba(6,6,12,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  const cx = w * 0.5;
  const cy = h * 0.54;
  const id = mineral.id;
  const banded = id.includes("agate") || id === "malachite";
  const cubic = mineral.system === "cubic" && mineral.metallic;
  const octa = id === "fluorite";
  const nugget = mineral.metallic && !cubic;

  if (banded) {
    for (let i = 8; i >= 0; i--) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * (0.12 + i * 0.035), h * (0.1 + i * 0.03), 0.18, 0, Math.PI * 2);
      ctx.fillStyle = hsv((hue + i * 10) % 360, s, Math.max(0.12, v + (i % 2 ? 0.1 : -0.16)));
      ctx.fill();
    }
  } else if (cubic) {
    const drawCube = (x: number, y: number, a: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -a * 0.55);
      ctx.lineTo(a * 0.7, -a * 0.15);
      ctx.lineTo(a * 0.7, a * 0.5);
      ctx.lineTo(0, a * 0.85);
      ctx.lineTo(-a * 0.7, a * 0.5);
      ctx.lineTo(-a * 0.7, -a * 0.15);
      ctx.closePath();
      const g = ctx.createLinearGradient(-a, -a, a, a);
      g.addColorStop(0, hsv(hue, s * 0.4, Math.min(1, v + 0.25)));
      g.addColorStop(0.45, hsv(hue, s, v));
      g.addColorStop(1, hsv(hue, s, Math.max(0.1, v - 0.28)));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    };
    drawCube(cx - w * 0.08, cy + h * 0.04, w * 0.28);
    drawCube(cx + w * 0.12, cy - h * 0.06, w * 0.22);
  } else if (octa) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.34);
    ctx.lineTo(cx + w * 0.28, cy);
    ctx.lineTo(cx, cy + h * 0.34);
    ctx.lineTo(cx - w * 0.28, cy);
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - w * 0.2, cy - h * 0.3, cx + w * 0.2, cy + h * 0.3);
    g.addColorStop(0, hsv(hue, Math.max(0, s - 0.1), Math.min(1, v + 0.22)));
    g.addColorStop(0.5, hsv((hue + 40) % 360, s, v));
    g.addColorStop(1, hsv(hue, s, Math.max(0.12, v - 0.25)));
    ctx.fillStyle = g;
    ctx.fill();
  } else if (nugget) {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28, cy);
    ctx.quadraticCurveTo(cx - w * 0.2, cy - h * 0.28, cx, cy - h * 0.22);
    ctx.quadraticCurveTo(cx + w * 0.3, cy - h * 0.3, cx + w * 0.26, cy);
    ctx.quadraticCurveTo(cx + w * 0.22, cy + h * 0.28, cx, cy + h * 0.24);
    ctx.quadraticCurveTo(cx - w * 0.3, cy + h * 0.22, cx - w * 0.28, cy);
    const g = ctx.createRadialGradient(cx - w * 0.1, cy - h * 0.1, 2, cx, cy, w * 0.4);
    g.addColorStop(0, hsv(hue, s * 0.35, Math.min(1, v + 0.3)));
    g.addColorStop(1, hsv(hue, s, Math.max(0.1, v - 0.2)));
    ctx.fillStyle = g;
    ctx.fill();
  } else {
    const prism = (x: number, y: number, sc: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4 * sc);
      ctx.lineTo(w * 0.13 * sc, -h * 0.18 * sc);
      ctx.lineTo(w * 0.15 * sc, h * 0.24 * sc);
      ctx.lineTo(0, h * 0.36 * sc);
      ctx.lineTo(-w * 0.15 * sc, h * 0.24 * sc);
      ctx.lineTo(-w * 0.13 * sc, -h * 0.18 * sc);
      ctx.closePath();
      const g = ctx.createLinearGradient(-w * 0.15 * sc, -h * 0.4 * sc, w * 0.15 * sc, h * 0.3 * sc);
      g.addColorStop(0, hsv(hue, Math.max(0, s - 0.18), Math.min(1, v + 0.32)));
      g.addColorStop(0.4, hsv(hue, s, v));
      g.addColorStop(1, hsv((hue + 18) % 360, s, Math.max(0.1, v - 0.32)));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4 * sc);
      ctx.lineTo(0, h * 0.36 * sc);
      ctx.strokeStyle = hsv(hue, s * 0.3, 1);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    };
    prism(cx, cy, 1, 0);
    prism(cx - w * 0.18, cy + h * 0.08, 0.62, -0.38);
    prism(cx + w * 0.16, cy + h * 0.1, 0.52, 0.42);
  }

  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.1, cy - h * 0.16, w * 0.1, h * 0.04, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function makeJewelCanvas(mineral: Mineral, size = 128) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  paintSpecimen(ctx, mineral, size, size, { isolated: true });
  return c;
}

/** Die-cut vinyl sticker: cream paper lip around the specimen silhouette. */
export function makeStickerCanvas(source: CanvasImageSource, size = 256) {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  const pad = Math.round(size * 0.16);
  const inner = size - pad * 2;
  const lip = Math.max(4, Math.round(size * 0.048));
  ctx.save();
  ctx.shadowColor = "#f3eee4";
  ctx.shadowBlur = 0;
  const steps = 18;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.shadowOffsetX = Math.cos(a) * lip;
    ctx.shadowOffsetY = Math.sin(a) * lip;
    ctx.drawImage(source, pad, pad, inner, inner);
  }
  ctx.restore();
  ctx.drawImage(source, pad, pad, inner, inner);
  return out;
}


export function Specimen({
  mineral,
  size = 48,
  className,
}: {
  mineral: Mineral;
  size?: number;
  className?: string;
}) {
  const src = SPECIMEN_PHOTOS[mineral.id];
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
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
  }, [mineral, size, src]);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("specimen-photo shrink-0", className)}
        style={{ width: size, height: size }}
        draggable={false}
      />
    );
  }

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function rarityTone(rarity: Mineral["rarity"]) {
  if (rarity === "legendary") return "text-warn";
  if (rarity === "rare") return "text-amethyst";
  if (rarity === "uncommon") return "text-hud";
  return "text-faint";
}

import { MINERALS, type Luster, type Magnetism, type Mineral } from "./minerals";

export type Features = {
  hue: number;
  sat: number;
  val: number;
  metallic: number;
  edge: number;
  hueBins: Float32Array;
};

export type Observation = {
  features?: Features;
  luster?: Luster | "skip";
  mohs?: number;
  streak?: "white" | "colored" | "black" | "red" | "green" | "yellow" | "skip";
  magnetism?: Magnetism | "skip";
  diaphaneity?: "opaque" | "translucent" | "transparent" | "skip";
};

export type FiredRule = {
  id: string;
  head: string;
  weight: number;
  description: string;
};

export type Ranked = {
  mineral: Mineral;
  score: number;
  visual: number;
  rules: number;
  fired: FiredRule[];
};

const TWO_PI = Math.PI * 2;

function hueDist(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d) / 180;
}

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 1e-6) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max < 1e-6 ? 0 : d / max;
  return { h, s, v: max };
}

export function featuresFromImageData(img: ImageData): Features {
  const px = img.data;
  const w = img.width;
  const h = img.height;
  const hueBins = new Float32Array(12);
  let hueSin = 0;
  let hueCos = 0;
  let sat = 0;
  let val = 0;
  let metallic = 0;
  let edge = 0;
  let n = 0;
  const step = w * h > 8192 ? 2 : 1;

  for (let y = 0; y < h - 1; y += step) {
    for (let x = 0; x < w - 1; x += step) {
      const i = (y * w + x) * 4;
      const a = px[i + 3];
      if (a < 24) continue;
      const r = px[i] / 255;
      const g = px[i + 1] / 255;
      const b = px[i + 2] / 255;
      const hsv = rgbToHsv(r, g, b);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const iR = (y * w + x + 1) * 4;
      const iD = ((y + 1) * w + x) * 4;
      const lumR = 0.2126 * (px[iR] / 255) + 0.7152 * (px[iR + 1] / 255) + 0.0722 * (px[iR + 2] / 255);
      const lumD = 0.2126 * (px[iD] / 255) + 0.7152 * (px[iD + 1] / 255) + 0.0722 * (px[iD + 2] / 255);
      edge += Math.abs(lum - lumR) + Math.abs(lum - lumD);
      if (hsv.v > 0.82 && hsv.s < 0.22) metallic += 1;
      if (hsv.s > 0.08) {
        const rad = (hsv.h * Math.PI) / 180;
        hueSin += Math.sin(rad);
        hueCos += Math.cos(rad);
        hueBins[Math.min(11, Math.floor(hsv.h / 30))] += 1;
      }
      sat += hsv.s;
      val += hsv.v;
      n += 1;
    }
  }

  if (n === 0) {
    return { hue: 0, sat: 0, val: 0.5, metallic: 0, edge: 0, hueBins };
  }

  const hue = ((Math.atan2(hueSin / n, hueCos / n) + TWO_PI) % TWO_PI) * (180 / Math.PI);
  return {
    hue,
    sat: sat / n,
    val: val / n,
    metallic: metallic / n,
    edge: edge / n,
    hueBins,
  };
}

export function extractFeatures(source: CanvasImageSource, size = 64): Features {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { hue: 0, sat: 0, val: 0.5, metallic: 0, edge: 0, hueBins: new Float32Array(12) };
  ctx.drawImage(source as CanvasImageSource, 0, 0, size, size);
  return featuresFromImageData(ctx.getImageData(0, 0, size, size));
}

function visualScore(m: Mineral, f: Features) {
  let bestHue = 1;
  for (const h of m.hues) bestHue = Math.min(bestHue, hueDist(f.hue, h));
  const satErr = Math.abs(f.sat - m.sat);
  const valErr = Math.abs(f.val - m.val);
  const metErr = Math.abs(f.metallic - (m.metallic ? 0.35 : 0.02));
  const s =
    1 -
    (bestHue * 0.46 + satErr * 0.22 + valErr * 0.18 + metErr * 0.14);
  return Math.max(0, Math.min(1, s));
}

function streakMatch(m: Mineral, streak: Observation["streak"]) {
  if (!streak || streak === "skip") return 0;
  const s = m.streak.toLowerCase();
  if (streak === "white") return s.includes("white") || s === "none" ? 0.16 : -0.12;
  if (streak === "black") return s.includes("black") || s.includes("gray") ? 0.18 : -0.1;
  if (streak === "red") return s.includes("red") || s.includes("cherry") ? 0.22 : -0.1;
  if (streak === "green") return s.includes("green") ? 0.2 : -0.1;
  if (streak === "yellow") return s.includes("yellow") ? 0.16 : -0.08;
  return s.includes("white") ? -0.08 : 0.1;
}

function lusterMatch(m: Mineral, luster: Observation["luster"]) {
  if (!luster || luster === "skip") return 0;
  if (m.luster === luster) return 0.14;
  if (m.metallic && luster === "metallic") return 0.14;
  if (m.metallic && luster !== "metallic" && luster !== "submetallic") return -0.12;
  if (!m.metallic && luster === "metallic") return -0.12;
  return -0.04;
}

export function identify(obs: Observation, catalog: Mineral[] = MINERALS): Ranked[] {
  const ranked: Ranked[] = new Array(catalog.length);
  for (let i = 0; i < catalog.length; i++) {
    const m = catalog[i];
    const fired: FiredRule[] = [];
    let rules = 0;
    const visual = obs.features ? visualScore(m, obs.features) : 0.28;

    if (obs.features) {
      fired.push({
        id: "R001",
        head: "color_consistent",
        weight: 0.12,
        description: "Body color vs catalog hues",
      });
      rules += 0.12 * visual;
    }

    if (obs.luster && obs.luster !== "skip") {
      const w = lusterMatch(m, obs.luster);
      rules += w;
      fired.push({
        id: "R003",
        head: "luster_confirmed",
        weight: w,
        description: `Luster ${obs.luster}`,
      });
    }

    if (typeof obs.mohs === "number") {
      const lo = m.mohs[0] - 0.6;
      const hi = m.mohs[1] + 0.6;
      const ok = obs.mohs >= lo && obs.mohs <= hi;
      const w = ok ? 0.18 : -0.14;
      rules += w;
      fired.push({
        id: "R004",
        head: "hardness_tested",
        weight: w,
        description: ok ? `Mohs ${obs.mohs} in range` : `Mohs ${obs.mohs} off ${m.mohs[0]}–${m.mohs[1]}`,
      });
    }

    if (obs.streak && obs.streak !== "skip") {
      const w = streakMatch(m, obs.streak);
      rules += w;
      fired.push({
        id: "R005",
        head: "streak_tested",
        weight: w,
        description: `Streak ${obs.streak}`,
      });
    }

    if (obs.magnetism && obs.magnetism !== "skip") {
      const ok = m.magnetism === obs.magnetism || (obs.magnetism === "none" && m.magnetism === "none");
      const w = ok ? 0.1 : -0.16;
      rules += w;
      fired.push({
        id: "R008",
        head: "magnetism_tested",
        weight: w,
        description: `Magnetism ${obs.magnetism}`,
      });
    }

    if (obs.diaphaneity && obs.diaphaneity !== "skip") {
      const d = m.diaphaneity.toLowerCase();
      const ok = d.includes(obs.diaphaneity);
      const w = ok ? 0.06 : -0.04;
      rules += w;
      fired.push({
        id: "R007",
        head: "transparency_reported",
        weight: w,
        description: `Diaphaneity ${obs.diaphaneity}`,
      });
    }

    if (!obs.mohs && (!obs.streak || obs.streak === "skip")) {
      rules -= 0.05;
      fired.push({
        id: "R013",
        head: "no_field_tests",
        weight: -0.05,
        description: "Image-only — field tests still open",
      });
    }

    const base = Math.min(visual * 0.62, 0.52);
    const score = Math.max(0, Math.min(1, base + rules));
    ranked[i] = { mineral: m, score, visual, rules, fired };
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

export function nextTest(obs: Observation): { key: string; prompt: string } | null {
  if (typeof obs.mohs !== "number") {
    return { key: "hardness", prompt: "Hardness — fingernail, penny, knife, glass, steel" };
  }
  if (!obs.streak || obs.streak === "skip") {
    return { key: "streak", prompt: "Streak on unglazed porcelain" };
  }
  if (!obs.luster || obs.luster === "skip") {
    return { key: "luster", prompt: "Luster — metallic or not" };
  }
  if (!obs.magnetism || obs.magnetism === "skip") {
    return { key: "magnetism", prompt: "Does a magnet take it?" };
  }
  return null;
}

export function syntheticFeatures(seed: number): Features {
  const hue = (seed * 47) % 360;
  const sat = 0.15 + ((seed * 13) % 70) / 100;
  const val = 0.2 + ((seed * 29) % 70) / 100;
  const metallic = seed % 7 === 0 ? 0.4 : 0.02;
  const hueBins = new Float32Array(12);
  hueBins[Math.min(11, Math.floor(hue / 30))] = 1;
  return { hue, sat, val, metallic, edge: 0.08, hueBins };
}

export async function featuresFromBlob(blob: Blob, size = 64): Promise<Features> {
  const bitmap = await createImageBitmap(blob);
  try {
    return extractFeatures(bitmap, size);
  } finally {
    bitmap.close();
  }
}

export function paintSignature(ctx: CanvasRenderingContext2D, mineral: Mineral, w: number, h: number) {
  const hue = mineral.hues[0] ?? 0;
  const s = mineral.sat;
  const v = mineral.val;
  const c = hsvCss(hue, s, v);
  const c2 = hsvCss((hue + 18) % 360, Math.min(1, s + 0.1), Math.max(0.08, v - 0.18));
  const g = ctx.createRadialGradient(w * 0.38, h * 0.32, 4, w * 0.5, h * 0.5, w * 0.7);
  g.addColorStop(0, hsvCss(hue, Math.max(0, s - 0.12), Math.min(1, v + 0.18)));
  g.addColorStop(0.55, c);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (mineral.id === "agate" || mineral.id === "ls-agate" || mineral.id === "malachite") {
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = hsvCss((hue + i * 12) % 360, s, Math.min(1, v + (i % 2 ? 0.15 : -0.12)));
      ctx.lineWidth = 3 + (i % 3);
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.52, 10 + i * 7, 8 + i * 6, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (mineral.metallic) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#f2f0e4";
    ctx.beginPath();
    ctx.ellipse(w * 0.34, h * 0.28, w * 0.16, h * 0.08, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = i % 2 ? "#fff" : "#000";
    ctx.fillRect((i * 17) % w, (i * 23) % h, 6, 4);
  }
  ctx.globalAlpha = 1;
}

function hsvCss(h: number, s: number, v: number) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return `rgb(${r},${g},${b})`;
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0,
    gp = 0,
    bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

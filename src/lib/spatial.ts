/** Uniform grid spatial hash. Cell size in degrees (~111 km at equator). */

export type Point = { lat: number; lng: number };

export class SpatialHash<T extends Point> {
  private cells = new Map<number, T[]>();
  readonly cell: number;

  constructor(items: T[], cell = 1) {
    this.cell = cell;
    for (const item of items) this.insert(item);
  }

  private key(lat: number, lng: number) {
    const i = Math.floor(lat / this.cell);
    const j = Math.floor(lng / this.cell);
    return (i + 90) * 1000 + (j + 180);
  }

  insert(item: T) {
    const k = this.key(item.lat, item.lng);
    const bucket = this.cells.get(k);
    if (bucket) bucket.push(item);
    else this.cells.set(k, [item]);
  }

  nearby(lat: number, lng: number, radiusCells = 1): T[] {
    const i0 = Math.floor(lat / this.cell);
    const j0 = Math.floor(lng / this.cell);
    const out: T[] = [];
    for (let i = i0 - radiusCells; i <= i0 + radiusCells; i++) {
      for (let j = j0 - radiusCells; j <= j0 + radiusCells; j++) {
        const bucket = this.cells.get((i + 90) * 1000 + (j + 180));
        if (bucket) out.push(...bucket);
      }
    }
    return out;
  }

  all(): T[] {
    const out: T[] = [];
    for (const bucket of this.cells.values()) out.push(...bucket);
    return out;
  }
}

export function projectConus(lat: number, lng: number, w: number, h: number, pad = 16) {
  const west = -125.5;
  const east = -66.0;
  const north = 49.5;
  const south = 24.4;
  const x = pad + ((lng - west) / (east - west)) * (w - pad * 2);
  const y = pad + ((north - lat) / (north - south)) * (h - pad * 2);
  return { x, y };
}

export function unprojectConus(x: number, y: number, w: number, h: number, pad = 16) {
  const west = -125.5;
  const east = -66.0;
  const north = 49.5;
  const south = 24.4;
  const lng = west + ((x - pad) / (w - pad * 2)) * (east - west);
  const lat = north - ((y - pad) / (h - pad * 2)) * (north - south);
  return { lat, lng };
}

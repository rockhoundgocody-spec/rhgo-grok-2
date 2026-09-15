#!/usr/bin/env python3
"""Flood-fill magenta key for isolated specimen chips."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = 256
PAD = 0.1


def is_magenta(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    mag = np.minimum(r, b) - g
    near = (r > 150) & (b > 150) & (g < 140) & (mag > 50)
    hot = (r > 200) & (b > 200) & (g < 90)
    return near | hot


def chroma(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    h, w = r.shape
    mag = is_magenta(r.astype(np.int16), g.astype(np.int16), b.astype(np.int16))
    visited = np.zeros((h, w), dtype=bool)
    stack: list[tuple[int, int]] = []

    def push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h:
            return
        if visited[y, x] or not mag[y, x]:
            return
        visited[y, x] = True
        stack.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while stack:
        x, y = stack.pop()
        push(x - 1, y)
        push(x + 1, y)
        push(x, y - 1)
        push(x, y + 1)

    arr[:, :, 3] = np.where(visited, 0, a)
    mag_score = (np.minimum(r.astype(np.int16), b.astype(np.int16)) - g.astype(np.int16)).astype(np.float32)
    fringe = (~visited) & (mag_score > 20) & (r > 90) & (b > 90)
    t = np.clip(mag_score / 90.0, 0, 1)
    for c in (0, 2):
        ch = arr[:, :, c].astype(np.float32)
        arr[:, :, c] = np.where(
            fringe,
            np.clip(ch * (1 - t * 0.55) + g.astype(np.float32) * t * 0.2, 0, 255),
            arr[:, :, c],
        ).astype(np.uint8)
    arr[:, :, 3] = np.where(fringe, (arr[:, :, 3].astype(np.float32) * (1 - t * 0.35)).astype(np.uint8), arr[:, :, 3])

    ys, xs = np.where(arr[:, :, 3] > 24)
    if len(xs) == 0:
        return Image.fromarray(arr)
    minx, maxx = int(xs.min()), int(xs.max())
    miny, maxy = int(ys.min()), int(ys.max())
    bw, bh = maxx - minx + 1, maxy - miny + 1
    side = max(bw, bh)
    pad = int(side * PAD)
    box = side + pad * 2
    sx = minx - (side - bw) // 2 - pad
    sy = miny - (side - bh) // 2 - pad
    keyed = Image.fromarray(arr)
    canvas = Image.new("RGBA", (box, box), (0, 0, 0, 0))
    canvas.paste(keyed, (-sx, -sy))
    return canvas.resize((OUT, OUT), Image.Resampling.LANCZOS)


def main() -> None:
    jobs = json.loads(sys.argv[1])
    out_dir = Path("/workspace/public/specimens/chips")
    out_dir.mkdir(parents=True, exist_ok=True)
    for job in jobs:
        dest = out_dir / f"{job['id']}.png"
        chroma(Path(job["src"])).save(dest)
        print(job["id"], dest.stat().st_size)


if __name__ == "__main__":
    main()

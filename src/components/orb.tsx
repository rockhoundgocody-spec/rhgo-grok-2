import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/perf";
import { cn } from "@/lib/utils";
import { mineralById, TRAY } from "@/lib/minerals";
import { makeJewelCanvas, makeStickerCanvas, specimenChip, SPECIMEN_CHIPS } from "@/components/specimen";

type BendUniforms = {
  uConcave: { value: number };
  uRipple: { value: number };
};

function bendMaterial(mat: THREE.MeshBasicMaterial, concave: number, uniformsOut: BendUniforms[]) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uConcave = { value: concave };
    shader.uniforms.uRipple = { value: 0 };
    shader.vertexShader = `uniform float uConcave; uniform float uRipple;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      float _d = length(transformed.xy);
      float _hole = 0.255;
      float _well = _d < _hole
        ? -sqrt(max(0.0, _hole * _hole - _d * _d)) * uConcave
        : -0.05 * exp(-(_d - _hole) * 2.1) * uConcave;
      if (uRipple > 0.001) {
        _well += sin(_d * 16.0 - uRipple * 8.5) * exp(-uRipple * 1.65) * 0.05;
      }
      transformed.z += _well;`,
    );
    uniformsOut.push(shader.uniforms as unknown as BendUniforms);
  };
  mat.customProgramCacheKey = () => `well-${concave}`;
}

function chime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const mk = (freq: number, gain: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now);
      o.stop(now + dur + 0.05);
    };
    mk(92, 0.04, 0.9);
    mk(184, 0.018, 0.7);
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* audio optional */
  }
}

type WorldFlowProp = {
  minerals: string[];
  rate: number;
  yours?: string[];
  pulse?: { id: string; mineralId: string };
};

type Grain = {
  mineralId: string;
  phi: number;
  r: number;
  yOff: number;
  spin: number;
  scale: number;
  tumble: number;
  yours: boolean;
  pulse: boolean;
};

type Ripple = { id: number; x: number; y: number };

export function AmethystOrb({
  size = 180,
  className = "",
  flow,
}: {
  size?: number;
  level?: number;
  className?: string;
  flow?: WorldFlowProp;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jewelsRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, on: false });
  const rippleT = useRef(0);
  const playRef = useRef<() => void>(() => {});
  const flowRef = useRef<WorldFlowProp>({ minerals: [], rate: 8 });
  flowRef.current = flow ?? flowRef.current;
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [fallback, setFallback] = useState(false);
  const ripple = size * 0.55;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const jewels = jewelsRef.current;
    if (!wrap || !canvas) return;
    const reduced = prefersReducedMotion();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setFallback(true);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 2.33, 0.05, 50);
    camera.position.set(0, 0.05, 2.05);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => {
      disposables.push(o);
      return o;
    };
    const bendUniforms: BendUniforms[] = [];

    const dustGeo = track(new THREE.BufferGeometry());
    const dustN = 90;
    const dustPos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      const rho = 0.4 + Math.pow(Math.random(), 0.6) * 1.5;
      const ang = Math.random() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(ang) * rho;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      dustPos[i * 3 + 2] = Math.sin(ang) * rho;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      track(
        new THREE.PointsMaterial({
          color: 0xffd9a0,
          size: 0.028,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        }),
      ),
    );
    dust.rotation.x = 0.12;
    dust.renderOrder = 6;
    scene.add(dust);

    const jewelCache = new Map<string, HTMLCanvasElement>();
    const jewelFor = (id: string) => {
      let chip = jewelCache.get(id);
      if (chip) return chip;
      const mineral = mineralById(id) ?? mineralById("quartz") ?? mineralById(TRAY[0].mineralId);
      if (!mineral) {
        const blank = document.createElement("canvas");
        blank.width = 256;
        blank.height = 256;
        jewelCache.set(id, blank);
        return blank;
      }
      chip = makeStickerCanvas(makeJewelCanvas(mineral, 200), 256);
      jewelCache.set(id, chip);
      const url = specimenChip(id);
      if (url) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          jewelCache.set(id, makeStickerCanvas(img, 256));
        };
        img.src = url;
      }
      return chip;
    };
    for (const id of Object.keys(SPECIMEN_CHIPS)) jewelFor(id);

    const grains: Grain[] = [];
    let lastPulse = "";
    const tmp = new THREE.Vector3();
    const octx = jewels?.getContext("2d") ?? null;
    const stamp = document.createElement("canvas");
    stamp.width = 256;
    stamp.height = 256;
    const sctx = stamp.getContext("2d");

    const birth = (mineralId: string, outer: boolean, pulse = false) => {
      const yours = pulse || (flowRef.current.yours?.includes(mineralId) ?? false);
      const g: Grain = {
        mineralId,
        phi: Math.random() * Math.PI * 2,
        r: outer ? 1.72 + Math.random() * 0.42 : 0.48 + Math.random() * 1.4,
        yOff: (Math.random() - 0.5) * 0.22,
        spin: pulse ? 0.2 : 0.08 + Math.random() * 0.2,
        scale: pulse ? 0.2 : 0.11 + Math.random() * 0.05,
        tumble: Math.random() * Math.PI * 2,
        yours,
        pulse,
      };
      grains.push(g);
      return g;
    };

    const torus = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.262, 0.008, 14, 180)),
      track(
        new THREE.MeshBasicMaterial({
          color: 0xfff4dc,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      ),
    );
    torus.rotation.x = Math.PI / 2 + 0.11;
    torus.position.z = 0.01;
    torus.renderOrder = 5;
    scene.add(torus);

    const torus2 = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.284, 0.0045, 10, 140)),
      track(
        new THREE.MeshBasicMaterial({
          color: 0xffc070,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      ),
    );
    torus2.rotation.x = Math.PI / 2 + 0.11;
    torus2.position.z = 0.01;
    torus2.renderOrder = 5;
    scene.add(torus2);

    const plateGeo = track(new THREE.PlaneGeometry(2.88, 2.88 / 2.33, 80, 36));

    const still = track(new THREE.TextureLoader().load("/companion/gargantua.webp"));
    still.colorSpace = THREE.SRGBColorSpace;
    still.minFilter = THREE.LinearFilter;

    const farMat = track(
      new THREE.MeshBasicMaterial({
        map: still,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );
    bendMaterial(farMat, 1.7, bendUniforms);
    const farPlate = new THREE.Mesh(plateGeo, farMat);
    farPlate.position.z = -0.22;
    farPlate.scale.setScalar(1.04);
    farPlate.renderOrder = 3;
    scene.add(farPlate);

    const heroMat = track(
      new THREE.MeshBasicMaterial({
        map: still,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );
    bendMaterial(heroMat, 1.35, bendUniforms);
    const heroPlate = new THREE.Mesh(plateGeo, heroMat);
    heroPlate.position.z = 0.02;
    heroPlate.renderOrder = 4;
    scene.add(heroPlate);

    const video = document.createElement("video");
    video.src = "/companion/gargantua.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    const vtex = track(new THREE.VideoTexture(video));
    vtex.colorSpace = THREE.SRGBColorSpace;
    vtex.minFilter = THREE.LinearFilter;
    vtex.generateMipmaps = false;

    const nearMat = track(
      new THREE.MeshBasicMaterial({
        map: vtex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );
    bendMaterial(nearMat, 1.28, bendUniforms);
    const nearPlate = new THREE.Mesh(plateGeo, nearMat);
    nearPlate.position.z = 0.04;
    nearPlate.renderOrder = 4;
    scene.add(nearPlate);

    const playVideo = () => {
      if (reduced) return;
      const p = video.play();
      if (p) void p.catch(() => {});
    };
    video.addEventListener("canplay", playVideo, { once: true });
    playRef.current = playVideo;
    playVideo();

    const look = new THREE.Vector3(0, -0.02, 0);
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 8 || h < 8) return;
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (jewels) {
        const jw = jewels.clientWidth || w;
        const jh = jewels.clientHeight || h;
        jewels.width = Math.max(1, Math.round(jw * pr));
        jewels.height = Math.max(1, Math.round(jh * pr));
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    if (jewels) ro.observe(jewels);

    let raf = 0;
    let running = true;
    let last = performance.now();
    const t0 = last;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = (now - t0) / 1000;

      mouse.x += ((pointer.current.on ? pointer.current.x : 0) - mouse.x) * 0.08;
      mouse.y += ((pointer.current.on ? pointer.current.y : 0) - mouse.y) * 0.08;

      if (rippleT.current > 0) {
        rippleT.current += dt;
        if (rippleT.current > 1.8) rippleT.current = 0;
      }
      for (const u of bendUniforms) u.uRipple.value = rippleT.current;

      camera.position.x = (reduced ? 0 : Math.sin(t * 0.22) * 0.18) + mouse.x * 0.32;
      camera.position.y = (reduced ? 0.04 : 0.04 + Math.cos(t * 0.18) * 0.07) + mouse.y * -0.18;
      camera.position.z = reduced ? 2.08 : 2.08 + Math.sin(t * 0.13) * 0.05;
      camera.lookAt(look);

      dust.rotation.y = reduced ? 0 : t * 0.11;
      torus.rotation.z = reduced ? 0 : t * 0.09;
      torus2.rotation.z = reduced ? 0 : -t * 0.055;

      const flowNow = flowRef.current;
      const catalog = flowNow.minerals.length ? flowNow.minerals : Object.keys(SPECIMEN_CHIPS);
      const yours = flowNow.yours ?? [];
      const rate = Math.max(8, flowNow.rate);
      const cap = Math.min(52, 10 + Math.floor(rate * 0.62));
      const inspiral = 0.016 + Math.min(0.09, rate * 0.00085);
      if (flowNow.pulse && flowNow.pulse.id !== lastPulse) {
        lastPulse = flowNow.pulse.id;
        birth(flowNow.pulse.mineralId, true, true);
      }
      while (grains.length < cap) {
        birth(catalog[grains.length % catalog.length], grains.length > 10);
      }
      while (grains.length > cap + 8) grains.pop();
      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i];
        g.phi += dt * g.spin * Math.pow(Math.max(g.r, 0.22), -1.25);
        g.r -= dt * inspiral * (0.45 + 0.9 / Math.max(g.r, 0.2));
        g.tumble += dt * (0.25 + g.spin * 0.4);
        if (g.r < 0.255) {
          if (grains.length > cap) {
            grains.splice(i, 1);
            continue;
          }
          const next = catalog[Math.floor(Math.random() * catalog.length)] ?? g.mineralId;
          g.mineralId = next;
          g.r = 1.74 + Math.random() * 0.4;
          g.phi = Math.random() * Math.PI * 2;
          g.yOff = (Math.random() - 0.5) * 0.22;
          g.scale = 0.11 + Math.random() * 0.05;
          g.yours = yours.includes(next);
          g.pulse = false;
        }
      }

      if (octx && jewels) {
        const pw = jewels.width;
        const ph = jewels.height;
        octx.clearRect(0, 0, pw, ph);
        const vis: { g: Grain; x: number; y: number; z: number; s: number; front: number; heat: number }[] = [];
        const cssW = Math.max(1, jewels.clientWidth);
        const pr = pw / cssW;
        const wellW = wrap.clientWidth * pr;
        const wellH = wrap.clientHeight * pr;
        const ox = (pw - wellW) / 2;
        const oy = (ph - wellH) / 2;
        const px = Math.min(wellW, wellH * 2.15);
        for (const g of grains) {
          const worldZ = Math.sin(g.phi) * g.r;
          tmp.set(Math.cos(g.phi) * g.r, g.yOff + Math.sin(g.phi * 1.7) * 0.05, worldZ);
          tmp.project(camera);
          if (tmp.z > 1 || tmp.z < -1) continue;
          const front = Math.max(0, Math.min(1, (worldZ + 0.15) / Math.max(0.45, g.r + 0.2)));
          const fall = Math.max(0.18, Math.min(1, (g.r - 0.255) / 1.35));
          const pop = 0.7 + 1.55 * Math.pow(front, 1.55);
          const s = g.scale * px * (0.4 + 0.6 * fall) * pop;
          const x = ox + (tmp.x * 0.5 + 0.5) * wellW;
          const y = oy + (-tmp.y * 0.5 + 0.5) * wellH - front * wellH * 0.1;
          const heat = Math.max(0, Math.min(1, 1 - (g.r - 0.255) / 1.15));
          vis.push({ g, x, y, z: tmp.z, s, front, heat });
        }
        vis.sort((a, b) => b.z - a.z);
        for (const v of vis) {
          const img = jewelFor(v.g.mineralId);
          const fade = Math.max(0.15, Math.min(1, (v.g.r - 0.22) / 0.2));
          if (sctx) {
            sctx.globalCompositeOperation = "source-over";
            sctx.globalAlpha = 1;
            sctx.clearRect(0, 0, 256, 256);
            sctx.drawImage(img, 0, 0, 256, 256);
            sctx.globalCompositeOperation = "multiply";
            sctx.fillStyle = `rgba(${Math.round(255 - v.heat * 8)}, ${Math.round(170 - v.heat * 22)}, ${Math.round(90 + (1 - v.heat) * 80)}, ${0.08 + v.heat * 0.32})`;
            sctx.fillRect(0, 0, 256, 256);
            if (v.g.yours || v.g.pulse) {
              sctx.fillStyle = v.g.pulse ? "rgba(255, 210, 120, 0.38)" : "rgba(210, 180, 255, 0.22)";
              sctx.fillRect(0, 0, 256, 256);
            }
            sctx.globalCompositeOperation = "screen";
            sctx.fillStyle = `rgba(255, 168, 72, ${v.heat * 0.22})`;
            sctx.fillRect(0, 0, 256, 256);
            sctx.globalCompositeOperation = "source-over";
          }
          octx.save();
          octx.translate(v.x, v.y);
          octx.rotate(v.g.tumble * 0.18);
          const card = 0.78 + 0.22 * Math.cos(v.g.tumble * 0.55);
          octx.scale(card, 1);
          octx.globalAlpha = fade;
          octx.shadowColor = `rgba(0,0,0,${0.3 + v.front * 0.5})`;
          octx.shadowBlur = 5 + v.front * 18;
          octx.shadowOffsetY = 3 + v.front * 10;
          octx.drawImage(sctx ? stamp : img, -v.s / 2, -v.s / 2, v.s, v.s);
          octx.restore();
        }
      }

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      running = !document.hidden;
      if (document.hidden) video.pause();
      else playVideo();
      if (running && !reduced) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    if (reduced) frame(t0);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      video.pause();
      video.removeAttribute("src");
      video.load();
      scene.clear();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current = {
      on: true,
      x: (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
      y: (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
    };
  };

  const onTap = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 720);
    rippleT.current = 0.01;
    playRef.current();
    if (navigator.vibrate) navigator.vibrate(16);
    chime();
  };

  return (
    <div className={cn("companion-stage w-full", className)} style={{ aspectRatio: "21 / 9", maxWidth: 560 }}>
      <div
        ref={wrapRef}
        className="companion"
        onPointerMove={onMove}
        onPointerLeave={() => {
          pointer.current.on = false;
        }}
        onPointerDown={onTap}
        role="button"
        tabIndex={0}
        aria-label="Companion singularity"
      >
        <div className="companion-bloom" aria-hidden />
        <span className="companion-hole" aria-hidden />
        {fallback ? (
          <img src="/companion/gargantua.webp" alt="" className="companion-disk" draggable={false} />
        ) : (
          <canvas ref={canvasRef} className="companion-canvas" aria-hidden />
        )}
        <div className="companion-streak" aria-hidden />
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full animate-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: ripple,
              height: ripple,
              marginLeft: -ripple / 2,
              marginTop: -ripple / 2,
              border: "1px solid hsla(40,100%,82%,0.55)",
            }}
            aria-hidden
          />
        ))}
      </div>
      {fallback ? null : <canvas ref={jewelsRef} className="companion-jewels" aria-hidden />}
    </div>
  );
}

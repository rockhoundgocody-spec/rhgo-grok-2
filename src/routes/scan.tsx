import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw, ScanLine, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shell";
import { Glass, HudCorners } from "@/components/glass";
import { ScanReticle } from "@/components/reticle";
import { Specimen, paintSpecimen, rarityTone, specimenPhoto } from "@/components/specimen";
import {
  extractFeatures,
  featuresFromBlob,
  identify,
  nextTest,
  type Observation,
  type Ranked,
} from "@/lib/classifier";
import { TRAY, mineralById, type Luster, type Magnetism } from "@/lib/minerals";
import { useEngine } from "@/lib/store";
import { cn } from "@/lib/utils";
import { recordWorldScan } from "@/lib/world-scans";

export const Route = createFileRoute("/scan")({ component: ScanPage });

type Stage = "ready" | "camera" | "result";

function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const addFind = useEngine((s) => s.addFind);

  const [stage, setStage] = useState<Stage>("ready");
  const [camError, setCamError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ranked, setRanked] = useState<Ranked[]>([]);
  const [obs, setObs] = useState<Observation>({});
  const [ms, setMs] = useState(0);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"lens" | "tray" | "bench">("tray");

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  const runFromFeatures = (features: Observation["features"]) => {
    const next: Observation = { ...obs, features };
    const t0 = performance.now();
    const r = identify(next);
    setMs(performance.now() - t0);
    setObs(next);
    setRanked(r);
    setStage("result");
    setSaved(false);
  };

  const openCamera = async () => {
    setCamError(null);
    setTab("lens");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setStage("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCamError("Camera blocked in this frame. Use the tray or upload.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const w = 512;
    const h = Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w) || 512;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setPreview(canvas.toDataURL("image/jpeg", 0.7));
    stopCam();
    const features = extractFeatures(canvas, 64);
    runFromFeatures(features);
  };

  const onFile = async (file: File) => {
    setTab("lens");
    const url = URL.createObjectURL(file);
    setPreview(url);
    const features = await featuresFromBlob(file, 64);
    runFromFeatures(features);
  };

  const scanTray = (mineralId: string) => {
    const m = mineralById(mineralId);
    if (!m) return;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#07060e";
    ctx.fillRect(0, 0, 256, 256);
    paintSpecimen(ctx, m, 256, 256);
    setPreview(specimenPhoto(mineralId) ?? canvas.toDataURL("image/png"));
    const features = extractFeatures(canvas, 64);
    setTab("tray");
    runFromFeatures(features);
  };

  const applyTest = (patch: Partial<Observation>) => {
    const next = { ...obs, ...patch };
    const t0 = performance.now();
    const r = identify(next);
    setMs(performance.now() - t0);
    setObs(next);
    setRanked(r);
  };

  const primary = ranked[0];
  const nxt = nextTest(obs);
  const tests = [
    typeof obs.mohs === "number" ? "hardness" : "",
    obs.streak && obs.streak !== "skip" ? "streak" : "",
    obs.luster && obs.luster !== "skip" ? "luster" : "",
    obs.magnetism && obs.magnetism !== "skip" ? "magnetism" : "",
  ].filter(Boolean);

  const save = () => {
    if (!primary) return;
    addFind({
      mineralId: primary.mineral.id,
      name: primary.mineral.name,
      formula: primary.mineral.formula,
      confidence: primary.score,
      source: tab === "bench" ? "bench" : tab === "tray" ? "tray" : "lens",
      tests,
      notes: nxt ? `Next: ${nxt.prompt}` : "Field tests complete",
    });
    void recordWorldScan({ data: { mineralId: primary.mineral.id } }).catch(() => {});
    setSaved(true);
  };

  const reset = () => {
    stopCam();
    setStage("ready");
    setRanked([]);
    setObs({});
    setPreview(null);
    setSaved(false);
    setCamError(null);
  };

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col pb-6">
      <TopBar
        title="Scan"
        right={
          stage !== "ready" ? (
            <button type="button" onClick={reset} className="grid size-11 place-items-center text-muted" aria-label="Close">
              <X size={18} />
            </button>
          ) : null
        }
      />

      {stage === "ready" ? (
        <div className="px-5">
          <ScanReticle state="idle" />
          <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
            Hold a specimen in the lens, pick a tray stone, or answer the bench. Ranking never leaves the device.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-black/30 p-1 hairline">
            <ModeBtn active={tab === "lens"} onClick={() => setTab("lens")} label="Lens" />
            <ModeBtn active={tab === "tray"} onClick={() => setTab("tray")} label="Tray" />
            <ModeBtn active={tab === "bench"} onClick={() => setTab("bench")} label="Bench" />
          </div>

          {tab === "lens" ? (
            <div className="mt-6 space-y-3">
              <Button variant="primary" size="lg" className="w-full" onClick={openCamera}>
                <ScanLine size={16} /> Open camera
              </Button>
              <label className="glass flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-sm text-fg focus-within:ring-2 focus-within:ring-hud/70">
                <Upload size={16} aria-hidden />
                Upload a frame
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onFile(f);
                  }}
                />
              </label>
              {camError ? <p className="text-[12px] text-warn">{camError}</p> : null}
            </div>
          ) : null}

          {tab === "tray" ? (
            <div className="mt-6">
              <p className="kicker mb-3">Known specimens</p>
              <div className="grid grid-cols-2 gap-2">
                {TRAY.map((t) => {
                  const m = mineralById(t.mineralId);
                  if (!m) return null;
                  return (
                    <button
                      key={t.mineralId}
                      type="button"
                      onClick={() => scanTray(t.mineralId)}
                      className="glass flex items-center gap-3 rounded-[18px] px-3 py-3 text-left transition-transform duration-150 active:scale-[0.98]"
                    >
                      <Specimen mineral={m} size={48} />
                      <div>
                        <div className="text-[13px] font-medium">{m.name}</div>
                        <div className="text-[11px] text-muted">{t.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {tab === "bench" ? (
            <div className="mt-6">
              <p className="mb-3 text-[13px] text-muted">No photo. Answer what you can. The atlas re-ranks instantly.</p>
              <FieldTests obs={obs} onChange={applyTest} />
              <Button
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                onClick={() => {
                  setTab("bench");
                  const t0 = performance.now();
                  const r = identify(obs);
                  setMs(performance.now() - t0);
                  setRanked(r);
                  setStage("result");
                  setSaved(false);
                }}
              >
                Rank atlas
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {stage === "camera" ? (
        <div className="relative mx-5 overflow-hidden rounded-[24px] bg-black">
          <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
          <HudCorners />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative size-[210px]">
              <div className="absolute inset-0 rounded-full border border-amethyst/55" />
              <div className="absolute inset-3 rounded-full border border-dashed border-amethyst/50 animate-spin-slow" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-5">
            <button
              type="button"
              onClick={capture}
              aria-label="Capture"
              className="size-16 rounded-full bg-mint shadow-[0_0_40px_-8px_rgba(159,232,208,0.7)] transition-transform duration-150 active:scale-95"
            />
          </div>
        </div>
      ) : null}

      {stage === "result" && primary ? (
        <div className="px-5">
          <div className="relative mb-5 overflow-hidden rounded-[22px]">
            {preview ? (
              <img src={preview} alt="" className="h-44 w-full object-contain bg-black/50" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-black/40">
                {mineralById(primary.mineral.id) ? (
                  <Specimen mineral={primary.mineral} size={96} />
                ) : null}
              </div>
            )}
            <HudCorners />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="kicker">Identified</div>
              <h2 className="display mt-1 text-[34px] leading-none text-fg">{primary.mineral.name}</h2>
              <div className="mt-2 font-mono text-[12px] text-muted">
                {primary.mineral.formula} · {primary.mineral.system} · Mohs {primary.mineral.mohs[0]}
                {primary.mineral.mohs[1] !== primary.mineral.mohs[0] ? `–${primary.mineral.mohs[1]}` : ""}
              </div>
              <div className={cn("mt-1 text-[11px] uppercase tracking-[0.16em]", rarityTone(primary.mineral.rarity))}>
                {primary.mineral.rarity}
              </div>
            </div>
            <div className="text-right">
              <div className="engine-num text-[32px] text-hud glow-hud">{Math.round(primary.score * 100)}</div>
              <div className="kicker">conf</div>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-muted">{primary.mineral.notes}</p>
          <p className="mt-2 font-mono text-[11px] text-faint">
            {ms.toFixed(2)} ms · {ranked.length} taxa scored
          </p>

          <ol className="mt-4 space-y-1.5">
            {ranked.slice(0, 4).map((r, i) => (
              <li key={r.mineral.id}>
                <Glass className={cn("flex items-center justify-between gap-3 px-3 py-2.5", i === 0 && "hud")}>
                  <span className={cn("text-[13px]", i === 0 ? "text-fg" : "text-muted")}>
                    {i + 1}. {r.mineral.name}
                  </span>
                  <span className="engine-num text-[11px] text-faint">{Math.round(r.score * 100)}</span>
                </Glass>
              </li>
            ))}
          </ol>

          <div className="mt-5">
            <div className="kicker mb-2">Field tests</div>
            <FieldTests obs={obs} onChange={applyTest} />
            {nxt ? (
              <p className="mt-2 text-[12px] text-hud">Next · {nxt.prompt}</p>
            ) : (
              <p className="mt-2 text-[12px] text-good">Tests closed. Confidence is rule-governed.</p>
            )}
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="primary" size="lg" className="flex-1" onClick={save} disabled={saved}>
              {saved ? "Logged to Geo-DEX" : "Save find"}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} aria-label="Scan again">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ModeBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 rounded-full text-[11px] uppercase tracking-[0.16em] transition-[background-color,color] duration-150",
        active ? "bg-fg text-bg" : "text-muted",
      )}
    >
      {label}
    </button>
  );
}

function FieldTests({
  obs,
  onChange,
}: {
  obs: Observation;
  onChange: (p: Partial<Observation>) => void;
}) {
  return (
    <div className="space-y-3">
      <Row label="Hardness">
        {(
          [
            [2, "nail"],
            [3, "penny"],
            [5, "knife"],
            [5.5, "glass"],
            [6.5, "steel"],
          ] as const
        ).map(([v, lab]) => (
          <Chip key={lab} active={obs.mohs === v} onClick={() => onChange({ mohs: v })}>
            {lab}
          </Chip>
        ))}
      </Row>
      <Row label="Streak">
        {(["white", "red", "black", "green", "yellow"] as const).map((v) => (
          <Chip key={v} active={obs.streak === v} onClick={() => onChange({ streak: v })}>
            {v}
          </Chip>
        ))}
      </Row>
      <Row label="Luster">
        {(["metallic", "vitreous", "waxy", "dull", "adamantine"] as Luster[]).map((v) => (
          <Chip key={v} active={obs.luster === v} onClick={() => onChange({ luster: v })}>
            {v}
          </Chip>
        ))}
      </Row>
      <Row label="Magnet">
        {(["none", "weak", "strong"] as Magnetism[]).map((v) => (
          <Chip key={v} active={obs.magnetism === v} onClick={() => onChange({ magnetism: v })}>
            {v}
          </Chip>
        ))}
      </Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="kicker mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-full px-3 text-[11px] transition-[background-color,color] duration-150",
        active ? "bg-amethyst text-bg" : "bg-elevated/80 text-muted hairline",
      )}
    >
      {children}
    </button>
  );
}

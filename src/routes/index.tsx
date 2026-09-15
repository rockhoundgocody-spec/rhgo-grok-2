import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScanLine, Zap } from "lucide-react";
import { AmethystOrb } from "@/components/orb";
import { Glass, HudCorners } from "@/components/glass";
import { Specimen } from "@/components/specimen";
import { useEngine } from "@/lib/store";
import { getLevel, getTitle, xpProgress, xpToNext } from "@/lib/leveling";
import { HOTSPOTS, LAND_LABEL } from "@/lib/hotspots";
import { MINERALS, mineralById } from "@/lib/minerals";
import { formatInt, dayKey } from "@/lib/utils";
import { BADGE_CATALOG } from "@/lib/badges";
import { listWorldScans, type WorldFlow } from "@/lib/world-scans";

export const Route = createFileRoute("/")({ component: Hub });

function luckyMineral() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const day = Math.floor((Date.now() - start) / 86400000);
  return MINERALS[day % MINERALS.length];
}

function Hub() {
  const player = useEngine((s) => s.player);
  const findsAll = useEngine((s) => s.finds);
  const badges = useEngine((s) => s.badges);
  const checkIn = useEngine((s) => s.checkIn);
  const grantXp = useEngine((s) => s.grantXp);
  const finds = useMemo(() => findsAll.filter((f) => !f.ephemeral), [findsAll]);
  const [toast, setToast] = useState<string | null>(null);
  const lucky = luckyMineral();
  const resonanceKey = `rhgo_resonance_${dayKey()}`;
  const [claimed, setClaimed] = useState(() => {
    try {
      return localStorage.getItem(resonanceKey) === "1";
    } catch {
      return false;
    }
  });
  const [world, setWorld] = useState<WorldFlow>({ scans: [], rate24h: 0 });
  const [boost, setBoost] = useState(0);
  const [pulse, setPulse] = useState<{ id: string; mineralId: string } | undefined>();
  const seenFind = useRef<string | null>(null);

  useEffect(() => {
    let live = true;
    const pull = async () => {
      try {
        const next = await listWorldScans();
        if (!live) return;
        setWorld(next);
        setBoost(0);
      } catch {
        /* well still runs on local finds */
      }
    };
    void pull();
    const t = window.setInterval(pull, 12000);
    return () => {
      live = false;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const latest = finds[0];
    if (!latest) return;
    if (seenFind.current === null) {
      seenFind.current = latest.id;
      return;
    }
    if (latest.id !== seenFind.current) {
      seenFind.current = latest.id;
      setPulse({ id: latest.id, mineralId: latest.mineralId });
      setBoost((n) => n + 1);
    }
  }, [finds]);

  useEffect(() => {
    const r = checkIn();
    if (r) setToast(`Check-in · +${r.gained} XP · streak ${r.streak}`);
  }, [checkIn]);

  const level = getLevel(player.xp);
  const title = getTitle(level);
  const progress = xpProgress(player.xp);
  const remaining = xpToNext(player.xp);
  const hunt = HOTSPOTS[(finds.length + level) % HOTSPOTS.length];
  const last = finds[0];
  const lastMineral = last ? mineralById(last.mineralId) : undefined;
  const localDay = finds.filter((f) => Date.now() - Date.parse(f.at) < 86400000).length;
  const rate = Math.max(world.rate24h + boost, localDay);
  const flowMinerals = useMemo(() => {
    const ids = world.scans.map((s) => s.mineralId);
    for (const f of finds.slice(0, 16)) {
      if (!ids.includes(f.mineralId)) ids.push(f.mineralId);
    }
    return ids;
  }, [world.scans, finds]);
  const yours = useMemo(() => [...new Set(finds.map((f) => f.mineralId))], [finds]);

  const claimResonance = () => {
    if (claimed) return;
    try {
      localStorage.setItem(resonanceKey, "1");
    } catch {
      /* private mode */
    }
    setClaimed(true);
    grantXp(18);
    setToast(`Geode resonance · ${lucky.name} · +18 XP`);
  };

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col px-5 pb-8">
      <header
        className="rise flex items-center justify-between"
        style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}
      >
        <div className="text-[15px] font-semibold tracking-tight">
          RockHound-
          <span className="display italic text-amethyst glow-amethyst">GO</span>
        </div>
        <div
          className="grid size-10 place-items-center rounded-full text-[11px] font-semibold uppercase text-fg/70"
          style={{
            border: "1px solid hsla(265,40%,70%,0.28)",
            background: "linear-gradient(160deg, hsla(265,40%,40%,0.18), hsla(0,0%,100%,0.03))",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.16)",
          }}
          aria-label="Profile"
        >
          {(player.name || "You")[0]}
        </div>
      </header>

      <div className="rise rise-1 relative z-10 -mx-5 mt-1 w-[calc(100%+2.5rem)] overflow-visible">
        <AmethystOrb
          size={196}
          level={level}
          flow={{ minerals: flowMinerals, rate, yours, pulse }}
        />
        <p className="kicker mt-1 text-center">
          {rate > 0 ? `World well · ${formatInt(rate)} / 24h` : "World well"}
        </p>
      </div>

      <div className="rise rise-2 mt-3 flex justify-center">
        <button
          type="button"
          onClick={claimResonance}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-transform active:scale-[0.96]"
          style={{
            background: claimed
              ? "hsla(38,50%,18%,0.45)"
              : "linear-gradient(135deg, hsla(40,100%,62%,0.28), hsla(28,95%,42%,0.32))",
            border: claimed ? "1px solid hsla(40,50%,50%,0.28)" : "1px solid hsla(40,100%,70%,0.45)",
            color: claimed ? "hsl(40,70%,78%)" : "#ffe9b0",
            boxShadow: claimed ? "none" : "0 0 22px hsla(38,100%,50%,0.22)",
          }}
        >
          <Zap size={12} className={claimed ? "" : "animate-pulse"} />
          {claimed ? "Resonance active" : "Daily challenge"}
        </button>
      </div>

      <section className="rise rise-3 mt-7">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="display text-[30px] leading-none tracking-tight">{title}</h2>
          <span className="engine-num text-[11px] text-fg/40">
            {remaining > 0 ? `${formatInt(remaining)} XP to next` : "Max level"}
          </span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-fg/35">
          <span>Level {level}</span>
          <span className="engine-num">{formatInt(player.xp)} XP</span>
        </div>
      </section>

      <div className="rise rise-4 mt-8 flex justify-center">
        <Link to="/scan" className="scan-cta">
          <ScanLine size={18} strokeWidth={2.5} aria-hidden />
          Scan
        </Link>
      </div>

      <section className="rise rise-5 mt-10">
        <div className="kicker mb-2">Tonight's ground</div>
        <Link to="/field" className="block">
          <Glass variant="hud" className="relative px-4 py-4">
            <HudCorners />
            <div className="display text-[22px] leading-tight">{hunt.name}</div>
            <div className="mt-1 text-[12px] capitalize tracking-wide text-fg/50">
              {hunt.state} · {LAND_LABEL[hunt.land]}
              {hunt.land === "protected" ? " · observe only" : ""}
            </div>
          </Glass>
        </Link>
      </section>

      <section className="rise rise-6 mt-5">
        <Glass className="grid grid-cols-3 divide-x divide-white/10">
          <Stat k="Streak" v={`${player.streak}d`} />
          <Stat k="Finds" v={String(finds.length)} />
          <Stat k="Marks" v={String(badges.length)} />
        </Glass>
      </section>

      {last && lastMineral ? (
        <section className="mt-5">
          <h2 className="kicker mb-2">Last logged</h2>
          <Link to="/dex" className="block">
            <Glass className="px-3 py-3">
              <div className="flex items-center gap-3">
                <Specimen mineral={lastMineral} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">{last.name}</span>
                    <span className="engine-num text-[11px] text-hud">{Math.round(last.confidence * 100)}%</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-faint">{last.formula}</div>
                </div>
              </div>
            </Glass>
          </Link>
        </section>
      ) : (
        <p className="mt-6 text-[13px] leading-relaxed text-muted">
          Point the lens, pick a tray stone, or run the bench. First ID never leaves the device.
        </p>
      )}

      {badges.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {BADGE_CATALOG.filter((b) => badges.includes(b.id)).map((b) => (
            <span
              key={b.id}
              className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted hairline"
            >
              {b.name}
            </span>
          ))}
        </div>
      ) : null}

      {toast ? (
        <p className="mt-4 text-[12px] text-hud glow-hud" role="status">
          {toast}
        </p>
      ) : null}
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-3 py-3">
      <div className="kicker">{k}</div>
      <div className="engine-num mt-1 text-[20px]">{v}</div>
    </div>
  );
}

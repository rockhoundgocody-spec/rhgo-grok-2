import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Glass } from "@/components/glass";
import { Specimen, rarityTone } from "@/components/specimen";
import { mineralById } from "@/lib/minerals";
import { HOTSPOTS, LAND_LABEL } from "@/lib/hotspots";
import { useEngine } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mineral/$id")({ component: MineralPage });

function MineralPage() {
  const { id } = Route.useParams();
  const m = mineralById(id);
  const viewMineral = useEngine((s) => s.viewMineral);

  useEffect(() => {
    if (m) viewMineral(m.id);
  }, [m, viewMineral]);

  if (!m) {
    return (
      <main className="px-5 py-16">
        <p className="text-muted">Unknown taxon.</p>
        <Link to="/dex" className="mt-4 inline-block text-hud">
          Back to Geo-DEX
        </Link>
      </main>
    );
  }

  const sites = HOTSPOTS.filter((h) => h.minerals.includes(m.id));

  return (
    <main className="mx-auto min-h-full max-w-lg px-5 pb-10">
      <div style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}>
        <Link to="/dex" className="inline-flex h-11 items-center gap-2 text-[13px] text-muted">
          <ArrowLeft size={16} aria-hidden />
          Geo-DEX
        </Link>
      </div>

      <div className="mt-2 flex justify-center">
        <div className="relative">
          <Specimen mineral={m} size={168} />
        </div>
      </div>

      <p className={cn("kicker mt-5", rarityTone(m.rarity))}>
        {m.group} · {m.rarity}
      </p>
      <h1 className="display mt-1 text-[40px] leading-none text-fg">{m.name}</h1>
      <p className="mt-3 font-mono text-[13px] text-muted">{m.formula}</p>

      <dl className="mt-6 grid grid-cols-2 gap-2">
        <Fact k="System" v={m.system} />
        <Fact k="Mohs" v={m.mohs[0] === m.mohs[1] ? String(m.mohs[0]) : `${m.mohs[0]}–${m.mohs[1]}`} />
        <Fact k="SG" v={m.sg[0] === m.sg[1] ? String(m.sg[0]) : `${m.sg[0]}–${m.sg[1]}`} />
        <Fact k="Streak" v={m.streak} />
        <Fact k="Luster" v={m.luster} />
        <Fact k="Magnet" v={m.magnetism} />
      </dl>

      <p className="mt-6 text-[14px] leading-relaxed text-fg">{m.notes}</p>
      <p className="mt-3 text-[13px] text-muted">{m.tests}</p>
      <p className="mt-2 text-[13px] text-muted">Cleavage · {m.cleavage}</p>
      <p className="mt-2 text-[13px] text-muted">Diaphaneity · {m.diaphaneity}</p>

      <h2 className="kicker mt-8">Localities</h2>
      <ul className="mt-2 space-y-1 text-[13px] text-muted">
        {m.localities.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      {sites.length > 0 ? (
        <>
          <h2 className="kicker mt-8">In the field atlas</h2>
          <ul className="mt-2 space-y-2">
            {sites.map((h) => (
              <li key={h.id}>
                <Link to="/field" className="block">
                  <Glass className="px-3 py-3">
                    <div className="text-[14px] text-fg">{h.name}</div>
                    <div className="text-[12px] text-muted">
                      {h.state} · {LAND_LABEL[h.land]}
                    </div>
                  </Glass>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <Glass className="px-3 py-3">
      <dt className="kicker">{k}</dt>
      <dd className="mt-1 text-[13px] capitalize">{v}</dd>
    </Glass>
  );
}

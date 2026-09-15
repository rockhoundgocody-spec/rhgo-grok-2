import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FieldMap, LandChip } from "@/components/field-map";
import { TopBar } from "@/components/shell";
import { Glass, HudCorners } from "@/components/glass";
import { HOTSPOTS, LAND_LABEL, type LandType } from "@/lib/hotspots";
import { mineralById } from "@/lib/minerals";
import { useEngine } from "@/lib/store";
import { grant } from "@/lib/badges";

export const Route = createFileRoute("/field")({ component: FieldPage });

const FILTERS: Array<LandType | "all"> = [
  "all",
  "public",
  "blm",
  "forest_service",
  "state_park",
  "fee",
  "protected",
];

function FieldPage() {
  const [land, setLand] = useState<LandType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = HOTSPOTS.find((h) => h.id === selectedId) ?? null;
  const badges = useEngine((s) => s.badges);

  const list = useMemo(
    () => (land === "all" ? HOTSPOTS : HOTSPOTS.filter((h) => h.land === land)),
    [land],
  );

  return (
    <main className="flex h-full min-h-full flex-col">
      <TopBar
        kicker="Atlas"
        title="Field"
        right={<span className="engine-num text-[11px] text-hud">{list.length}</span>}
      />
      <div className="flex gap-1.5 overflow-x-auto px-5 pb-3">
        {FILTERS.map((f) => (
          <LandChip key={f} land={f} active={land === f} onClick={() => setLand(f)} />
        ))}
      </div>
      <div className="relative mx-5 min-h-[280px] flex-1 overflow-hidden rounded-[24px] hairline">
        <FieldMap
          selected={selected}
          filterLand={land}
          onSelect={(h) => {
            setSelectedId(h?.id ?? null);
            if (h?.land === "protected") {
              useEngine.setState({ badges: grant("steward", badges) });
            }
          }}
        />
        <HudCorners />
      </div>
      <div className="px-5 py-4">
        {selected ? (
          <Glass className="px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[16px] font-semibold tracking-tight">{selected.name}</h2>
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
                {selected.state} · {LAND_LABEL[selected.land]}
              </span>
            </div>
            {selected.land === "protected" ? (
              <p className="mt-2 text-[12px] text-danger">Observe only. Collecting here is illegal.</p>
            ) : null}
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{selected.description}</p>
            <p className="mt-2 text-[12px] text-faint">{selected.rules}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.minerals.map((id) => {
                const m = mineralById(id);
                return m ? (
                  <Link
                    key={id}
                    to="/mineral/$id"
                    params={{ id }}
                    className="rounded-full px-2.5 py-1 text-[11px] text-fg hairline"
                  >
                    {m.name}
                  </Link>
                ) : (
                  <span key={id} className="rounded-full px-2.5 py-1 text-[11px] text-muted hairline">
                    {id}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] text-muted">{selected.note}</p>
          </Glass>
        ) : (
          <p className="text-[13px] text-muted">
            Drag the map. Tap a pin. Land status is first-class — protected sites stay in the atlas so you know where
            not to pocket.
          </p>
        )}
      </div>
    </main>
  );
}

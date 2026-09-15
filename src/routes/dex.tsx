import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/shell";
import { Glass } from "@/components/glass";
import { Specimen, rarityTone } from "@/components/specimen";
import { VirtualList } from "@/components/virtual-list";
import { mineralById, searchMinerals } from "@/lib/minerals";
import { useEngine, type Find } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dex")({ component: DexPage });

function DexPage() {
  const finds = useEngine((s) => s.finds);
  const [tab, setTab] = useState<"finds" | "atlas">("finds");
  const [q, setQ] = useState("");

  const atlas = useMemo(() => searchMinerals(q), [q]);
  const filteredFinds = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return finds;
    return finds.filter((f) => f.name.toLowerCase().includes(n) || f.formula.toLowerCase().includes(n));
  }, [finds, q]);

  return (
    <main className="flex h-full min-h-full flex-col">
      <TopBar
        kicker="Archive"
        title="Geo-DEX"
        right={
          <span className="engine-num text-[11px] text-hud">{tab === "finds" ? filteredFinds.length : atlas.length}</span>
        }
      />
      <div className="px-5">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-black/30 p-1 hairline">
          <TabBtn active={tab === "finds"} onClick={() => setTab("finds")} label="Finds" />
          <TabBtn active={tab === "atlas"} onClick={() => setTab("atlas")} label="Atlas" />
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === "finds" ? "Search finds" : "Name, formula, locality"}
            className="glass h-11 w-full rounded-full px-4 text-sm text-fg placeholder:text-faint"
          />
        </label>
      </div>

      {tab === "finds" ? (
        filteredFinds.length === 0 ? (
          <p className="px-5 pt-8 text-[13px] text-muted">
            Empty. Scan a tray specimen or run the bench — finds persist on this device.
          </p>
        ) : (
          <VirtualList
            items={filteredFinds}
            rowHeight={84}
            className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-6"
            getKey={(f) => f.id}
            render={(f) => <FindRow find={f} />}
          />
        )
      ) : (
        <VirtualList
          items={atlas}
          rowHeight={80}
          className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-6"
          getKey={(m) => m.id}
          render={(m) => (
            <Link to="/mineral/$id" params={{ id: m.id }} className="block h-[76px]">
              <Glass className="flex h-full items-center gap-3 px-3">
                <Specimen mineral={m} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium">{m.name}</div>
                  <div className="font-mono text-[11px] text-muted">
                    {m.formula} · {m.system}
                  </div>
                </div>
                <span className={cn("text-[10px] uppercase tracking-[0.14em]", rarityTone(m.rarity))}>{m.rarity}</span>
              </Glass>
            </Link>
          )}
        />
      )}
    </main>
  );
}

function FindRow({ find }: { find: Find }) {
  const m = mineralById(find.mineralId);
  return (
    <Link to="/mineral/$id" params={{ id: find.mineralId }} className="block h-[80px]">
      <Glass className="flex h-full items-center gap-3 px-3">
        {m ? <Specimen mineral={m} size={48} /> : <div className="size-12 rounded-full bg-elevated" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium">{find.name}</span>
            {find.ephemeral ? <span className="text-[10px] uppercase tracking-[0.12em] text-warn">stress</span> : null}
          </div>
          <div className="font-mono text-[11px] text-muted">
            {find.formula} · {find.source}
          </div>
        </div>
        <span className="engine-num text-[12px] text-hud">{Math.round(find.confidence * 100)}</span>
      </Glass>
    </Link>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full text-[11px] uppercase tracking-[0.16em] transition-[background-color,color] duration-150",
        active ? "bg-fg text-bg" : "text-muted",
      )}
    >
      {label}
    </button>
  );
}

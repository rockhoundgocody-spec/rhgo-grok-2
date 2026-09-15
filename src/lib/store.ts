import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey, yesterdayKey, uid } from "./utils";
import { mineralById, type Mineral } from "./minerals";
import { evaluateBadges, type BadgeId } from "./badges";

export type Find = {
  id: string;
  mineralId: string;
  name: string;
  formula: string;
  confidence: number;
  at: string;
  day: string;
  lat?: number;
  lng?: number;
  source: "lens" | "tray" | "bench";
  tests: string[];
  notes: string;
  ephemeral?: boolean;
};

export type Player = {
  name: string;
  xp: number;
  streak: number;
  lastCheckIn: string | null;
  scans: number;
  createdAt: string;
};

type EngineState = {
  player: Player;
  finds: Find[];
  badges: BadgeId[];
  viewed: string[];
  hydrated: boolean;
  checkIn: () => { gained: number; streak: number } | null;
  addFind: (input: Omit<Find, "id" | "at" | "day"> & { id?: string }) => Find;
  viewMineral: (id: string) => void;
  grantXp: (n: number) => void;
  seedStress: (n: number) => void;
  clearStress: () => void;
  resetAll: () => void;
};

const INITIAL_PLAYER: Player = {
  name: "Field",
  xp: 0,
  streak: 0,
  lastCheckIn: null,
  scans: 0,
  createdAt: new Date().toISOString(),
};

function awardXp(mineral: Mineral | undefined, confidence: number, tests: string[]) {
  const base = mineral?.xp ?? 10;
  const conf = 0.7 + confidence * 0.5;
  const lab = 1 + Math.min(3, tests.length) * 0.08;
  return Math.round(base * conf * lab);
}

export const useEngine = create<EngineState>()(
  persist(
    (set, get) => ({
      player: INITIAL_PLAYER,
      finds: [],
      badges: [],
      viewed: [],
      hydrated: false,

      checkIn: () => {
        const today = dayKey();
        const p = get().player;
        if (p.lastCheckIn === today) return null;
        const cont = p.lastCheckIn === yesterdayKey();
        const streak = cont ? p.streak + 1 : 1;
        const gained = 25 + Math.min(20, streak * 2);
        set({
          player: { ...p, streak, lastCheckIn: today, xp: p.xp + gained },
        });
        refreshBadges(set, get);
        return { gained, streak };
      },

      grantXp: (n) => {
        const p = get().player;
        set({ player: { ...p, xp: p.xp + Math.max(0, Math.round(n)) } });
      },

      addFind: (input) => {
        const mineral = mineralById(input.mineralId);
        const find: Find = {
          id: input.id ?? uid("find"),
          mineralId: input.mineralId,
          name: input.name,
          formula: input.formula,
          confidence: input.confidence,
          at: new Date().toISOString(),
          day: dayKey(),
          lat: input.lat,
          lng: input.lng,
          source: input.source,
          tests: input.tests,
          notes: input.notes,
          ephemeral: input.ephemeral,
        };
        const xp = input.ephemeral ? 0 : awardXp(mineral, input.confidence, input.tests);
        const p = get().player;
        const finds = [find, ...get().finds];
        set({
          finds,
          player: {
            ...p,
            xp: p.xp + xp,
            scans: p.scans + (input.ephemeral ? 0 : 1),
          },
        });
        if (!input.ephemeral) refreshBadges(set, get);
        return find;
      },

      viewMineral: (id) => {
        const viewed = get().viewed;
        if (viewed.includes(id)) return;
        set({ viewed: [...viewed, id] });
        refreshBadges(set, get);
      },

      seedStress: (n) => {
        const catalog = mineralById;
        const batch: Find[] = new Array(n);
        const now = Date.now();
        for (let i = 0; i < n; i++) {
          const idx = i % 57;
          const ids = [
            "quartz",
            "amethyst",
            "pyrite",
            "calcite",
            "fluorite",
            "malachite",
            "agate",
            "hematite",
            "garnet",
            "obsidian",
          ];
          const mid = ids[i % ids.length];
          const m = catalog(mid);
          batch[i] = {
            id: `stress_${now}_${i}`,
            mineralId: mid,
            name: m?.name ?? mid,
            formula: m?.formula ?? "",
            confidence: 0.5 + ((i * 17) % 50) / 100,
            at: new Date(now - i * 1000).toISOString(),
            day: dayKey(),
            source: "bench",
            tests: [],
            notes: "",
            ephemeral: true,
          };
          void idx;
        }
        set({ finds: [...batch, ...get().finds.filter((f) => !f.ephemeral)] });
      },

      clearStress: () => {
        set({ finds: get().finds.filter((f) => !f.ephemeral) });
      },

      resetAll: () => {
        set({
          player: { ...INITIAL_PLAYER, createdAt: new Date().toISOString() },
          finds: [],
          badges: [],
          viewed: [],
        });
      },
    }),
    {
      name: "rhgo.field-engine.v1",
      partialize: (s) => ({
        player: s.player,
        finds: s.finds.filter((f) => !f.ephemeral).slice(0, 240),
        badges: s.badges,
        viewed: s.viewed.slice(0, 200),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

function refreshBadges(
  set: (partial: Partial<EngineState>) => void,
  get: () => EngineState,
) {
  const s = get();
  const next = evaluateBadges({
    finds: s.finds.filter((f) => !f.ephemeral),
    player: s.player,
    viewed: s.viewed,
    existing: s.badges,
  });
  if (next.length !== s.badges.length) set({ badges: next });
}

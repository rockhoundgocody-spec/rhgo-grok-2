import type { Find, Player } from "./store";
import { mineralById } from "./minerals";

export type BadgeId =
  | "first-scan"
  | "streak-3"
  | "streak-7"
  | "ten-finds"
  | "five-species"
  | "rare-find"
  | "bench-hand"
  | "atlas-reader"
  | "engine"
  | "steward";

export type Badge = {
  id: BadgeId;
  name: string;
  detail: string;
};

export const BADGE_CATALOG: Badge[] = [
  { id: "first-scan", name: "First Contact", detail: "Log a specimen." },
  { id: "streak-3", name: "Three Suns", detail: "Check in three days running." },
  { id: "streak-7", name: "Week in the Field", detail: "Seven-day streak." },
  { id: "ten-finds", name: "Ten in the Dex", detail: "Ten logged finds." },
  { id: "five-species", name: "Range Finder", detail: "Five distinct species." },
  { id: "rare-find", name: "Uncommon Ground", detail: "Log a rare or legendary." },
  { id: "bench-hand", name: "Bench Hand", detail: "Hardness and streak on one find." },
  { id: "atlas-reader", name: "Atlas Reader", detail: "Open ten mineral dossiers." },
  { id: "engine", name: "Engine Room", detail: "Run a bench trial." },
  { id: "steward", name: "Steward", detail: "Open a protected site and leave it." },
];

export function evaluateBadges(input: {
  finds: Find[];
  player: Player;
  viewed: string[];
  existing: BadgeId[];
}): BadgeId[] {
  const have = new Set(input.existing);
  const real = input.finds;
  if (real.length >= 1) have.add("first-scan");
  if (input.player.streak >= 3) have.add("streak-3");
  if (input.player.streak >= 7) have.add("streak-7");
  if (real.length >= 10) have.add("ten-finds");
  const species = new Set(real.map((f) => f.mineralId));
  if (species.size >= 5) have.add("five-species");
  if (real.some((f) => {
    const r = mineralById(f.mineralId)?.rarity;
    return r === "rare" || r === "legendary";
  })) have.add("rare-find");
  if (real.some((f) => f.tests.includes("hardness") && f.tests.includes("streak"))) have.add("bench-hand");
  if (input.viewed.length >= 10) have.add("atlas-reader");
  return BADGE_CATALOG.map((b) => b.id).filter((id) => have.has(id));
}

export function grant(id: BadgeId, existing: BadgeId[]) {
  return existing.includes(id) ? existing : [...existing, id];
}

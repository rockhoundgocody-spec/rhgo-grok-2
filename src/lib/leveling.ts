export const LEVEL_TITLES = [
  "Pebble Scout",
  "Crystal Apprentice",
  "Vein Walker",
  "Geode Guardian",
  "Field Cartographer",
  "Titan Rockhound",
  "Steward of Stone",
] as const;

const BASE_XP = 1500;
const GROWTH = 1.4;

export function levelThreshold(level: number) {
  if (level <= 1) return 0;
  let total = 0;
  for (let k = 0; k < level - 1; k++) total += BASE_XP * Math.pow(GROWTH, k);
  return Math.round(total);
}

export function getLevel(xp: number) {
  for (let level = LEVEL_TITLES.length; level >= 1; level--) {
    if (xp >= levelThreshold(level)) return level;
  }
  return 1;
}

export function getTitle(level: number) {
  return LEVEL_TITLES[Math.min(Math.max(level, 1) - 1, LEVEL_TITLES.length - 1)];
}

export function xpProgress(xp: number) {
  const level = getLevel(xp);
  if (level >= LEVEL_TITLES.length) return 100;
  const floor = levelThreshold(level);
  const ceil = levelThreshold(level + 1);
  return Math.min(100, Math.max(0, ((xp - floor) / (ceil - floor)) * 100));
}

export function xpToNext(xp: number) {
  const level = getLevel(xp);
  if (level >= LEVEL_TITLES.length) return 0;
  return levelThreshold(level + 1) - xp;
}

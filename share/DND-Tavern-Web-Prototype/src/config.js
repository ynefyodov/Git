export const ARENA = {
  width: 960,
  height: 540,
  margin: 24,
};

export const PLAYER_CONFIG = {
  maxHp: 120,
  speed: 220,
  radius: 15,
  color: "#7cc7ff",
};

export const ATTACK_CONFIG = {
  cooldown: 0.35,
  meleeRange: 54,
  meleeDamage: 24,
  swingDuration: 0.14,
  rangedProjectileSpeed: 560,
  rangedProjectileRadius: 5,
  rangedProjectileDamage: 17,
  rangedProjectileLifetime: 1.05,
};

export const ENEMY_TYPES = {
  rat: {
    maxHp: 28,
    speed: 92,
    radius: 14,
    damage: 9,
    color: "#c96f2e",
    score: 1,
  },
  thug: {
    maxHp: 56,
    speed: 82,
    radius: 17,
    damage: 15,
    color: "#933f2b",
    score: 2,
  },
  cultist: {
    maxHp: 44,
    speed: 128,
    radius: 13,
    damage: 14,
    color: "#6a4fc3",
    score: 2,
  },
  tavern_guard_boss: {
    maxHp: 680,
    speed: 84,
    radius: 31,
    damage: 24,
    color: "#d9c05f",
    score: 20,
    chargeCooldown: 3.1,
    chargeDuration: 0.95,
    chargeSpeedMultiplier: 2.7,
  },
  dock_warden_boss: {
    maxHp: 760,
    speed: 88,
    radius: 32,
    damage: 26,
    color: "#c9b27a",
    score: 24,
    chargeCooldown: 2.9,
    chargeDuration: 1.05,
    chargeSpeedMultiplier: 2.85,
  },
};

export const WAVES_LEVEL_1 = [
  { id: 1, start: 0, end: 30, spawnEvery: 1.35, spawnCount: 1, pool: ["rat"] },
  { id: 2, start: 30, end: 60, spawnEvery: 0.95, spawnCount: 1, pool: ["rat", "thug"] },
  { id: 3, start: 60, end: 75, spawnEvery: 0.58, spawnCount: 2, pool: ["thug", "cultist"] },
  { id: 4, start: 75, end: 90, spawnEvery: 0.48, spawnCount: 2, pool: ["thug", "cultist", "cultist"] },
  { id: 5, start: 90, end: 94, spawnEvery: 2.5, spawnCount: 1, pool: [] },
];

export const LEVEL_2_TIME_OFFSET = 95;

export const WAVES_LEVEL_2 = [
  { id: 1, start: LEVEL_2_TIME_OFFSET + 0, end: LEVEL_2_TIME_OFFSET + 25, spawnEvery: 0.9, spawnCount: 1, pool: ["rat", "thug"] },
  { id: 2, start: LEVEL_2_TIME_OFFSET + 25, end: LEVEL_2_TIME_OFFSET + 50, spawnEvery: 0.62, spawnCount: 2, pool: ["thug", "cultist"] },
  { id: 3, start: LEVEL_2_TIME_OFFSET + 50, end: LEVEL_2_TIME_OFFSET + 70, spawnEvery: 0.5, spawnCount: 2, pool: ["cultist", "cultist", "thug"] },
  { id: 4, start: LEVEL_2_TIME_OFFSET + 70, end: LEVEL_2_TIME_OFFSET + 82, spawnEvery: 0.42, spawnCount: 3, pool: ["cultist", "thug", "cultist"] },
  { id: 5, start: LEVEL_2_TIME_OFFSET + 82, end: LEVEL_2_TIME_OFFSET + 86, spawnEvery: 2.2, spawnCount: 1, pool: [] },
];

export const WAVES = WAVES_LEVEL_1;

export const GAME_CONFIG = {
  contactTickSeconds: 0.5,
  runEndPadding: 1.2,
  runEndPaddingLevel2: 1.4,
};

/** Maps combat role → perk id for each hero class (shared combat code uses roles). */
export const PERK_CLASS_MAP = {
  melee: {
    splash: "sweeping_cleave",
    lifesteal: "blood_anchor",
    rapid: "battle_tempo",
    power: "skullbreaker",
    reach: "extended_blade",
    pierce: null,
  },
  ranged: {
    splash: "shrapnel_burst",
    lifesteal: "siphon_link",
    rapid: "trigger_focus",
    power: "marked_prey",
    reach: null,
    pierce: "piercing_volley",
  },
};

export const PROGRESSION_CONFIG = {
  /**
   * Боевой опыт за забег: начисляется за убийства (по ENEMY_TYPES[*].score).
   * Каждая планка даёт +1 черту, максимум до босса локации.
   */
  experiencePerUpgrade: 18,
  upgradesBeforeBoss: 3,
  perks: [
    {
      id: "sweeping_cleave",
      classes: ["fighter", "barbarian"],
      name: "Великий размах",
      description: "Как «Великое оружие»: удар цепляет соседние цели",
    },
    {
      id: "blood_anchor",
      classes: ["fighter", "barbarian"],
      name: "Высасывание жизни",
      description: "Часть урона ближних ударов превращается в восстановленные хит‑поинты",
    },
    {
      id: "battle_tempo",
      classes: ["fighter", "barbarian"],
      name: "Многоатака",
      description: "Сокращает время между ударами — классический темп бойца",
    },
    {
      id: "skullbreaker",
      classes: ["fighter", "barbarian"],
      name: "Свирепые удары",
      description: "Каждый удар ближнего боя бьёт сильнее",
    },
    {
      id: "extended_blade",
      classes: ["fighter", "barbarian"],
      name: "Стойка с длинным клинком",
      description: "Увеличивает досягаемость ближней атаки",
    },
    {
      id: "shrapnel_burst",
      classes: ["ranger", "warlock"],
      name: "Залп по площади",
      description: "Снаряд ранит цель и ближайших врагов (колючий луч / осколочный выстрел)",
    },
    {
      id: "siphon_link",
      classes: ["ranger", "warlock"],
      name: "Поглощение жизни",
      description: "Часть урона дальнобойных попаданий идёт на восстановление HP",
    },
    {
      id: "trigger_focus",
      classes: ["ranger", "warlock"],
      name: "Быстрые руки",
      description: "Сокращает задержку между выстрелами",
    },
    {
      id: "marked_prey",
      classes: ["ranger", "warlock"],
      name: "Охотничий знак / Агония",
      description: "Усиливает урон каждого попадания снарядом",
    },
    {
      id: "piercing_volley",
      classes: ["ranger", "warlock"],
      name: "Пробивающий выстрел",
      description: "Снаряд может поразить ещё одну цель по траектории",
    },
  ],
  splashRadius: 44,
  rangedSplashRadius: 38,
  splashDamageMultiplier: 0.45,
  rangedSplashDamageMultiplier: 0.38,
  lifestealRatio: 0.12,
  rapidFireCooldownMultiplier: 0.88,
  maxRapidFireStacks: 4,
  powerShotDamageBonus: 6,
  reachBonusPerStack: 5,
  maxReachStacks: 6,
  maxPierceStacks: 4,
};

export function perksForClass(classId) {
  if (!classId) return [];
  return PROGRESSION_CONFIG.perks.filter((p) => p.classes.includes(classId));
}

/** combatRole: "melee" | "ranged" — не id класса. */
export function perkIdForRole(combatRole, role) {
  const row = combatRole ? PERK_CLASS_MAP[combatRole] : null;
  if (!row) return null;
  return row[role] ?? null;
}

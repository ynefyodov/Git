export const ARENA = {
  width: 960,
  height: 540,
  margin: 24,
};

export const WORLD = {
  width: 1600,
  height: 960,
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

export const RACE_DEFS = [
  {
    id: "human",
    name: "Люди",
    passive: "+1 стартовая черта и ускоренное получение XP",
    modifiers: { bonusStartPerks: 1, xpGain: 1.2 },
  },
  {
    id: "elf",
    name: "Эльфы",
    passive: "Уклонение и бонус к дальнему бою",
    modifiers: { evasion: 0.12, rangedDamage: 1.12 },
  },
  {
    id: "dwarf",
    name: "Дварфы",
    passive: "Повышенное HP и сопротивление урону",
    modifiers: { hp: 1.18, armor: 0.18 },
  },
  {
    id: "gnome",
    name: "Гномы",
    passive: "Высокая мобильность и уклонение",
    modifiers: { moveSpeed: 1.12, evasion: 0.1 },
  },
  {
    id: "orc",
    name: "Орки",
    passive: "Высокий урон и одно возрождение",
    modifiers: { damage: 1.14, extraLives: 1 },
  },
  {
    id: "goblin",
    name: "Гоблины",
    passive: "Уклонение и скорость атаки",
    modifiers: { evasion: 0.08, attackSpeed: 1.14 },
  },
  {
    id: "demon",
    name: "Демоны",
    passive: "Высокий урон при низком запасе жизней",
    modifiers: { damage: 1.18, hp: 0.82, lifesteal: 0.08 },
  },
  {
    id: "undead",
    name: "Нежить",
    passive: "Сильное уклонение и серия саморесов",
    modifiers: { hp: 0.86, evasion: 0.18, extraLives: 2 },
  },
];

export const CLASS_ACTIVE_SKILLS = {
  warrior: { name: "Щит", cooldown: 18, duration: 6, effect: "armorBurst" },
  barbarian: { name: "Ярость", cooldown: 16, duration: 6, effect: "damageBurst" },
  rogue_melee: { name: "Ускользание", cooldown: 14, duration: 4.5, effect: "evasionBurst" },
  rogue_ranged: { name: "Скорость ветра", cooldown: 15, duration: 5, effect: "attackBurst" },
  mage: { name: "Цепь", cooldown: 20, duration: 7, effect: "chainBurst" },
  priest: { name: "Благодать", cooldown: 18, duration: 8, effect: "graceAura" },
};

export const CLASS_BASE_STATS = {
  warrior: { hp: 170, combatRole: "melee", armor: 0.15 },
  barbarian: { hp: 150, combatRole: "melee", lowHpDamageBoost: 0.3 },
  rogue_melee: { hp: 120, combatRole: "melee", doubleStrikeChance: 0.35 },
  rogue_ranged: { hp: 120, combatRole: "ranged", farDamageBonus: 0.22 },
  mage: { hp: 100, combatRole: "ranged", chainTargets: 2 },
  priest: { hp: 100, combatRole: "ranged", selfRegen: 0.8 },
};

export const SUBCLASS_BRANCHES = {
  warrior: [
    { id: "knight", name: "Рыцарь", focus: "armor", perkIds: ["armor_mastery", "vital_guard"] },
    { id: "spearman", name: "Копейщик", focus: "range", perkIds: ["reach_mastery", "chain_reach"] },
    { id: "gladiator", name: "Гладиатор", focus: "damage", perkIds: ["damage_mastery", "execute_strike"] },
    { id: "witcher", name: "Ведьмак", focus: "lifesteal", perkIds: ["lifesteal_mastery", "blood_oath"] },
  ],
  barbarian: [
    { id: "berserker_path", name: "Путь берсерка", focus: "attackSpeed", perkIds: ["attack_speed_mastery", "battle_tempo"] },
    { id: "control_path", name: "Путь контроля", focus: "range", perkIds: ["reach_mastery", "control_field"] },
    { id: "war_path", name: "Путь войны", focus: "damage", perkIds: ["damage_mastery", "war_cry"] },
    { id: "life_path", name: "Путь жизни", focus: "lifesteal", perkIds: ["lifesteal_mastery", "blood_anchor"] },
  ],
  rogue_melee: [
    { id: "thief", name: "Вор", focus: "moveSpeed", perkIds: ["move_speed_mastery", "ghost_step"] },
    { id: "pickpocket", name: "Карманник", focus: "range", perkIds: ["reach_mastery", "quick_lunge"] },
    { id: "assassin", name: "Ассассин", focus: "damage", perkIds: ["damage_mastery", "critical_line"] },
    { id: "vampire", name: "Вампир", focus: "lifesteal", perkIds: ["lifesteal_mastery", "blood_oath"] },
  ],
  rogue_ranged: [
    { id: "hunter", name: "Охотник", focus: "attackSpeed", perkIds: ["attack_speed_mastery", "trigger_focus"] },
    { id: "sniper", name: "Снайпер", focus: "range", perkIds: ["reach_mastery", "piercing_volley"] },
    { id: "ranger_path", name: "Рейнджер", focus: "damage", perkIds: ["damage_mastery", "marked_prey"] },
    { id: "killer", name: "Убийца", focus: "lifesteal", perkIds: ["lifesteal_mastery", "siphon_link"] },
  ],
  mage: [
    { id: "fire_school", name: "Школа огня", focus: "damage", perkIds: ["damage_mastery", "fire_brand"] },
    { id: "ice_school", name: "Школа льда", focus: "range", perkIds: ["reach_mastery", "frost_shell"] },
    { id: "storm_school", name: "Школа молний", focus: "attackSpeed", perkIds: ["attack_speed_mastery", "storm_pulse"] },
    { id: "earth_school", name: "Школа земли", focus: "armor", perkIds: ["armor_mastery", "stone_skin"] },
  ],
  priest: [
    { id: "templar", name: "Храмовник", focus: "armor", perkIds: ["armor_mastery", "vital_guard"] },
    { id: "bard", name: "Бард", focus: "moveSpeed", perkIds: ["move_speed_mastery", "grace_step"] },
    { id: "monk", name: "Монах", focus: "damage", perkIds: ["damage_mastery", "spirit_strike"] },
    { id: "shaman", name: "Шаман", focus: "attackSpeed", perkIds: ["attack_speed_mastery", "totem_rhythm"] },
  ],
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
  upgradesBeforeBoss: 4,
  perks: [
    {
      id: "armor_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Оплот",
      description: "Повышает броню и снижает входящий урон",
    },
    {
      id: "reach_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Длинная рука",
      description: "Увеличивает дальность и досягаемость атаки",
    },
    {
      id: "damage_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Казнь",
      description: "Усиливает прямой урон от атак",
    },
    {
      id: "lifesteal_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Кровавая печать",
      description: "Часть нанесённого урона лечит персонажа",
    },
    {
      id: "attack_speed_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Темп боя",
      description: "Повышает скорость атаки",
    },
    {
      id: "move_speed_mastery",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged", "mage", "priest"],
      name: "Лёгкий шаг",
      description: "Повышает скорость передвижения",
    },
    {
      id: "vital_guard",
      classes: ["warrior", "priest"],
      name: "Живой бастион",
      description: "Повышает максимум HP и регенерацию",
    },
    {
      id: "blood_oath",
      classes: ["warrior", "barbarian", "rogue_melee", "rogue_ranged"],
      name: "Кровавая клятва",
      description: "Усиленный вампиризм и урон на низком HP",
    },
    {
      id: "piercing_volley",
      classes: ["rogue_ranged", "mage"],
      name: "Пробивающий залп",
      description: "Снаряды пробивают дополнительные цели",
    },
    {
      id: "trigger_focus",
      classes: ["rogue_ranged", "barbarian", "shaman", "mage", "priest"],
      name: "Фокус темпа",
      description: "Сокращает кулдауны атак и умений",
    },
    {
      id: "marked_prey",
      classes: ["rogue_ranged", "mage"],
      name: "Метка добычи",
      description: "Бонус к урону по ближайшим целям",
    },
    {
      id: "siphon_link",
      classes: ["rogue_ranged", "mage", "priest"],
      name: "Связь жнеца",
      description: "Рanged-урон частично конвертируется в лечение",
    },
    {
      id: "battle_tempo",
      classes: ["barbarian", "rogue_melee"],
      name: "Боевое ускорение",
      description: "Дает стаки скорости атаки за серию ударов",
    },
    {
      id: "war_cry",
      classes: ["barbarian"],
      name: "Боевой клич",
      description: "Краткий буст урона и защиты в ближнем бою",
    },
    {
      id: "ghost_step",
      classes: ["rogue_melee", "bard"],
      name: "Теневой шаг",
      description: "Добавляет уклонение и скорость перемещения",
    },
    {
      id: "critical_line",
      classes: ["rogue_melee"],
      name: "Линия убийцы",
      description: "Сильно повышает критический урон",
    },
    {
      id: "stone_skin",
      classes: ["mage", "priest", "warrior"],
      name: "Каменная кожа",
      description: "Увеличивает броню и устойчивость к контактному урону",
    },
    {
      id: "storm_pulse",
      classes: ["mage"],
      name: "Импульс бури",
      description: "Ускоряет атаки и слегка отталкивает врагов",
    },
    {
      id: "frost_shell",
      classes: ["mage", "priest"],
      name: "Морозный панцирь",
      description: "Снижает входящий урон и повышает выживаемость",
    },
    {
      id: "fire_brand",
      classes: ["mage"],
      name: "Огненная метка",
      description: "Добавляет периодический урон по поражённым врагам",
    },
    {
      id: "grace_step",
      classes: ["priest", "bard"],
      name: "Шаг благодати",
      description: "Повышает скорость и эффективность лечения",
    },
    {
      id: "spirit_strike",
      classes: ["priest", "monk"],
      name: "Удар духа",
      description: "Усиливает урон от базовых атак",
    },
    {
      id: "control_field",
      classes: ["barbarian", "mage", "priest"],
      name: "Поле контроля",
      description: "Улучшает контроль толпы и замедление врагов",
    },
    {
      id: "execute_strike",
      classes: ["warrior", "rogue_melee"],
      name: "Казнящий удар",
      description: "Финишный бонус к урону по целям с низким HP",
    },
    {
      id: "chain_reach",
      classes: ["warrior", "mage"],
      name: "Цепная досягаемость",
      description: "Бонус к дальности и количеству задетых целей",
    },
    {
      id: "quick_lunge",
      classes: ["rogue_melee"],
      name: "Быстрый выпад",
      description: "Повышает мобильность и шанс проскока через врагов",
    },
    {
      id: "totem_rhythm",
      classes: ["priest"],
      name: "Ритм тотема",
      description: "Повышает скорость атаки и небольшое лечение в секунду",
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
  maxArmorStacks: 8,
  maxMoveSpeedStacks: 8,
  maxDamageStacks: 8,
  maxLifestealStacks: 8,
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

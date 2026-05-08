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
  rangedRange: 430,
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
  murloc: {
    maxHp: 36,
    speed: 138,
    radius: 12,
    damage: 11,
    color: "#4fc3c6",
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

export const ADVENTURE_LOCATIONS = {
  tavern_interior: {
    name: "Таверна внутри",
    icon: "🍺",
    description: "Стартовый зал: день или ночь, то пустой, то шумный, но без NPC на арене.",
    basePool: ["rat", "thug"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0,
    objective: "survive",
    variants: ["day", "night", "quiet", "busy"],
  },
  city_street: {
    name: "Улица города",
    icon: "🏘️",
    description: "Средневековая улица: сухо или дождливо, видимость и темп боя меняются.",
    basePool: ["thug", "cultist", "rat"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 0,
    objective: "survive",
    variants: ["dry", "rain"],
  },
  market_square: {
    name: "Рыночная площадь",
    icon: "🛍️",
    description: "Открытый узел города, где враги давят числом и флангами.",
    basePool: ["thug", "thug", "cultist", "rat"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0.1,
    objective: "survive",
    variants: ["open", "crowded"],
  },
  forge: {
    name: "Кузница",
    icon: "⚒️",
    description: "Бой у горнов и двора кузни: жар и тесные проходы.",
    basePool: ["thug", "cultist"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0.25,
    objective: "survive",
    variants: ["inside", "outside"],
  },
  forest_path: {
    name: "Лесная тропа",
    icon: "🌲",
    description: "Узкая дорога между деревьями: нужно прорваться по маршруту.",
    basePool: ["cultist", "rat"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0.9,
    objective: "path",
    variants: ["clear", "foggy"],
  },
  dark_forest: {
    name: "Тёмный лес",
    icon: "🌑",
    description: "Плохая видимость, опасные стычки и частые ловушки.",
    basePool: ["cultist", "cultist", "thug"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 1.3,
    objective: "path",
    variants: ["night", "mist"],
  },
  cave: {
    name: "Пещера",
    icon: "🕳️",
    description: "Каменные коридоры и узкие карманы, где сложно кайтить.",
    basePool: ["murloc", "cultist", "thug"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 0.35,
    objective: "survive",
    variants: ["wet", "echoing"],
  },
  ruins_crypt: {
    name: "Руины / склеп",
    icon: "🪦",
    description: "Старые своды и засады: враги крепче и дольше держат прессинг.",
    basePool: ["cultist", "cultist", "murloc"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 0.45,
    objective: "survive",
    variants: ["ruins", "crypt"],
  },
  campfire_camp: {
    name: "Лагерь у костра",
    icon: "🔥",
    description: "Короткая передышка на маршруте, но дозоры врага рядом.",
    basePool: ["rat", "thug", "murloc"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0.15,
    objective: "survive",
    variants: ["dusk", "night"],
  },
  castle_courtyard: {
    name: "Замковый двор",
    icon: "🏰",
    description: "Финальный узел цепочки: тяжёлые волны и элитные группы.",
    basePool: ["thug", "cultist", "murloc", "cultist"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 0.55,
    objective: "survive",
    variants: ["banner", "siege"],
  },
  river: {
    name: "Река",
    icon: "🌊",
    description: "Множество мурлоков и плотные волны на переправах.",
    basePool: ["murloc", "murloc", "rat"],
    bossTypeId: "dock_warden_boss",
    trapIntensity: 0,
    objective: "survive",
  },
  unknown: {
    name: "Неизвестно",
    icon: "?",
    description: "Непредсказуемый участок пути с мутирующими условиями боя.",
    basePool: ["rat", "thug", "cultist", "murloc"],
    bossTypeId: "tavern_guard_boss",
    trapIntensity: 0.4,
    objective: "survive",
  },
};

export const ADVENTURE_ROUTE_GRAPH = {
  tavern_interior: { left: "city_street", forward: "market_square", right: "forge" },
  city_street: { left: "market_square", forward: "forge", right: "campfire_camp" },
  market_square: { left: "forge", forward: "city_street", right: "castle_courtyard" },
  forge: { left: "forest_path", forward: "market_square", right: "campfire_camp" },
  forest_path: { left: "dark_forest", forward: "cave", right: "campfire_camp" },
  dark_forest: { left: "cave", forward: "ruins_crypt", right: "campfire_camp" },
  cave: { left: "ruins_crypt", forward: "dark_forest", right: "castle_courtyard" },
  ruins_crypt: { left: "castle_courtyard", forward: "campfire_camp", right: "cave" },
  campfire_camp: { left: "forest_path", forward: "ruins_crypt", right: "castle_courtyard" },
  castle_courtyard: { left: "ruins_crypt", forward: "market_square", right: "dark_forest" },
  river: { left: "market_square", forward: "castle_courtyard", right: "cave" },
  unknown: { left: "forest_path", forward: "city_street", right: "river" },
};

export const ADVENTURE_VISUALS = {
  tavern_interior: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.0, y: 0.0, w: 0.24, h: 0.3 },
    moodboardVariantCrops: {
      day: { x: 0.0, y: 0.0, w: 0.12, h: 0.3 },
      night: { x: 0.12, y: 0.0, w: 0.12, h: 0.3 },
      quiet: { x: 0.0, y: 0.0, w: 0.12, h: 0.3 },
      busy: { x: 0.12, y: 0.0, w: 0.12, h: 0.3 },
    },
    baseColor: "#2a1d1a",
    lineColor: "#3f2a26",
    accentColor: "#5e3e2e",
    overlayColor: "rgba(80, 42, 18, 0.2)",
  },
  city_street: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.245, y: 0.0, w: 0.255, h: 0.3 },
    moodboardVariantCrops: {
      dry: { x: 0.245, y: 0.0, w: 0.127, h: 0.3 },
      rain: { x: 0.373, y: 0.0, w: 0.127, h: 0.3 },
    },
    baseColor: "#1a212b",
    lineColor: "#273446",
    accentColor: "#364860",
    overlayColor: "rgba(40, 58, 86, 0.2)",
  },
  market_square: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.5, y: 0.0, w: 0.24, h: 0.3 },
    baseColor: "#222026",
    lineColor: "#393145",
    accentColor: "#524064",
    overlayColor: "rgba(82, 55, 94, 0.2)",
  },
  forge: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.0, y: 0.3, w: 0.24, h: 0.32 },
    moodboardVariantCrops: {
      inside: { x: 0.0, y: 0.3, w: 0.12, h: 0.32 },
      outside: { x: 0.12, y: 0.3, w: 0.12, h: 0.32 },
    },
    baseColor: "#2c1f1a",
    lineColor: "#4a3028",
    accentColor: "#7a4a2f",
    overlayColor: "rgba(140, 62, 18, 0.25)",
  },
  forest_path: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.252, y: 0.3, w: 0.248, h: 0.32 },
    moodboardVariantCrops: {
      clear: { x: 0.252, y: 0.3, w: 0.124, h: 0.32 },
      foggy: { x: 0.376, y: 0.3, w: 0.124, h: 0.32 },
    },
    baseColor: "#18251a",
    lineColor: "#243b2a",
    accentColor: "#335039",
    overlayColor: "rgba(32, 90, 54, 0.22)",
  },
  dark_forest: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.5, y: 0.3, w: 0.245, h: 0.32 },
    moodboardVariantCrops: {
      night: { x: 0.5, y: 0.3, w: 0.1225, h: 0.32 },
      mist: { x: 0.6225, y: 0.3, w: 0.1225, h: 0.32 },
    },
    baseColor: "#0f1a13",
    lineColor: "#1a2a20",
    accentColor: "#273f30",
    overlayColor: "rgba(18, 44, 28, 0.34)",
  },
  cave: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.0, y: 0.62, w: 0.24, h: 0.34 },
    moodboardVariantCrops: {
      wet: { x: 0.0, y: 0.62, w: 0.12, h: 0.34 },
      echoing: { x: 0.12, y: 0.62, w: 0.12, h: 0.34 },
    },
    baseColor: "#181c22",
    lineColor: "#252e39",
    accentColor: "#344558",
    overlayColor: "rgba(36, 48, 70, 0.24)",
  },
  ruins_crypt: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.24, y: 0.62, w: 0.18, h: 0.34 },
    moodboardVariantCrops: {
      ruins: { x: 0.24, y: 0.62, w: 0.09, h: 0.34 },
      crypt: { x: 0.33, y: 0.62, w: 0.09, h: 0.34 },
    },
    baseColor: "#201b24",
    lineColor: "#32293a",
    accentColor: "#4b3a5c",
    overlayColor: "rgba(68, 44, 78, 0.24)",
  },
  campfire_camp: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.42, y: 0.62, w: 0.18, h: 0.34 },
    moodboardVariantCrops: {
      dusk: { x: 0.42, y: 0.62, w: 0.09, h: 0.34 },
      night: { x: 0.51, y: 0.62, w: 0.09, h: 0.34 },
    },
    baseColor: "#2a2118",
    lineColor: "#3e2f23",
    accentColor: "#6a482e",
    overlayColor: "rgba(120, 76, 34, 0.22)",
  },
  castle_courtyard: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.62, y: 0.62, w: 0.22, h: 0.34 },
    moodboardVariantCrops: {
      banner: { x: 0.62, y: 0.62, w: 0.11, h: 0.34 },
      siege: { x: 0.73, y: 0.62, w: 0.11, h: 0.34 },
    },
    baseColor: "#1f2228",
    lineColor: "#2d3440",
    accentColor: "#3e4e62",
    overlayColor: "rgba(52, 70, 94, 0.24)",
  },
  river: {
    backgroundKey: "docks_bg",
    moodboardCrop: { x: 0.33, y: 0.0, w: 0.17, h: 0.3 },
    baseColor: "#132331",
    lineColor: "#1f3a50",
    accentColor: "#2d5672",
    overlayColor: "rgba(38, 88, 128, 0.24)",
  },
  unknown: {
    backgroundKey: "tavern_bg",
    moodboardCrop: { x: 0.74, y: 0.0, w: 0.24, h: 0.3 },
    baseColor: "#1f1f22",
    lineColor: "#2f3038",
    accentColor: "#474a58",
    overlayColor: "rgba(52, 52, 64, 0.2)",
  },
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

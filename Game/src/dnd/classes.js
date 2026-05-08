/** Классы D&D 5e: визуал и лор; механика боя идёт через combatRole. */
export const HERO_CLASSES = [
  {
    id: "warrior",
    name: "Воин",
    tagline: "Щит и стойкость: режет входящий урон и держит переднюю линию.",
    combatRole: "melee",
  },
  {
    id: "barbarian",
    name: "Варвар",
    tagline: "Ярость и напор: чем ниже HP, тем больнее удары.",
    combatRole: "melee",
  },
  {
    id: "rogue_melee",
    name: "Разбойник (мили)",
    tagline: "Мобильный дуэлянт с сериями ударов и высоким уклонением.",
    combatRole: "melee",
  },
  {
    id: "rogue_ranged",
    name: "Разбойник (рейндж)",
    tagline: "Скейлится от дистанции и быстро разбирает одиночные цели.",
    combatRole: "ranged",
  },
  {
    id: "mage",
    name: "Маг",
    tagline: "Бьёт по нескольким целям и усиливается через школу стихии.",
    combatRole: "ranged",
  },
  {
    id: "priest",
    name: "Прист",
    tagline: "Поддержка и выживаемость: ауры и контроль в центре драки.",
    combatRole: "ranged",
  },
];

export function getHeroClass(classId) {
  return HERO_CLASSES.find((h) => h.id === classId);
}

export function combatRoleForClass(classId) {
  if (!classId) return "melee";
  return getHeroClass(classId)?.combatRole ?? "melee";
}

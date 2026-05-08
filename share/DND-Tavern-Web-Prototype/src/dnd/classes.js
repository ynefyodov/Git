/** Классы D&D 5e: визуал и лор; механика боя идёт через combatRole. */
export const HERO_CLASSES = [
  {
    id: "fighter",
    name: "Воин",
    tagline: "Владение оружием и тактикой. Держит строй и рубит всё, что подошло слишком близко.",
    combatRole: "melee",
  },
  {
    id: "barbarian",
    name: "Варвар",
    tagline: "Ярость, инстинкт и удар телом. Чем меньше слов — тем громче звук топора.",
    combatRole: "melee",
  },
  {
    id: "ranger",
    name: "Следопыт",
    tagline: "Дистанция, выбор цели и один выстрел — одна проблема меньше.",
    combatRole: "ranged",
  },
  {
    id: "warlock",
    name: "Колдун",
    tagline: "Энергия договора в руке: луч, что находит жертву без промаха по намерению.",
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

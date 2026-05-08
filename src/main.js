import {
  ARENA,
  ATTACK_CONFIG,
  CLASS_ACTIVE_SKILLS,
  CLASS_BASE_STATS,
  ENEMY_TYPES,
  GAME_CONFIG,
  PROGRESSION_CONFIG,
  RACE_DEFS,
  SUBCLASS_BRANCHES,
  WAVES_LEVEL_1,
  WAVES_LEVEL_2,
  WORLD,
  perkIdForRole,
  perksForClass,
} from "./config.js";
import { loadAssets } from "./assets.js";
import { Player } from "./entities/player.js";
import { WaveSpawner } from "./systems/spawner.js";
import {
  applyEnemyContactDamage,
  applyProjectileHits,
  circlesWithinRadius,
} from "./systems/collision.js";
import { renderHud } from "./ui/hud.js";
import { pickRandomStory } from "./lore/stories.js";
import { HERO_CLASSES, combatRoleForClass, getHeroClass } from "./dnd/classes.js";
import { connectCoop, attachGuestKeyCapture } from "./net/coop.js";
import { Enemy } from "./entities/enemy.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart-btn");
const classPanel = document.getElementById("class-panel");
const raceButtonsEl = document.getElementById("race-buttons");
const classButtonsEl = document.getElementById("class-buttons");
const branchButtonsEl = document.getElementById("branch-buttons");
const introClassBlurb = document.getElementById("intro-class-blurb");
const introPanel = document.getElementById("intro-panel");
const introTextEl = document.getElementById("intro-text");
const battleBtn = document.getElementById("battle-btn");
const intermissionPanel = document.getElementById("intermission-panel");
const intermissionTextEl = document.getElementById("intermission-text");
const continueBtn = document.getElementById("continue-btn");
const upgradePanel = document.getElementById("upgrade-panel");
const upgradeTitleEl = document.getElementById("upgrade-title");
const upgradeDescEl = document.getElementById("upgrade-desc");
const upgradeOptionsEl = document.getElementById("upgrade-options");
const coopWsUrlInput = document.getElementById("coop-ws-url");
const coopRoomIdInput = document.getElementById("coop-room-id");
const coopPlayerNameInput = document.getElementById("coop-player-name");
const coopJoinBtn = document.getElementById("coop-join-btn");
const coopReadyBtn = document.getElementById("coop-ready-btn");
const coopStartBtn = document.getElementById("coop-start-btn");
const coopStatusEl = document.getElementById("coop-status");
const coopRoomPlayers = document.getElementById("coop-room-players");

canvas.width = ARENA.width;
canvas.height = ARENA.height;

const state = {
  started: false,
  ended: false,
  result: "Не начато",
  runPhase: "introPickClass",
  level: 1,
  story: null,
  storyId: null,
  raceId: null,
  heroClass: null,
  subclassId: null,
  skillCooldownLeft: 0,
  skillDurationLeft: 0,
  skillActive: false,
  skillRequested: false,
  remainingLives: 0,
  intermissionShown: false,
  player: null,
  player2: null,
  guestInput: null,
  coopRole: "solo",
  coopConn: null,
  coopSelfId: null,
  coopRoomId: "public",
  coopPlayers: [],
  coopReady: false,
  coopCanStart: false,
  coopStarted: false,
  coopActiveGuestId: null,
  coopGuestConnected: false,
  coopLastSendMs: 0,
  guestInputCapture: null,
  guestSnapshot: null,
  input: null,
  enemies: [],
  projectiles: [],
  spawner: null,
  elapsedSeconds: 0,
  kills: 0,
  experience: 0,
  score: 0,
  perkStacks: {},
  gainedPerks: [],
  lastUpgrade: "",
  lastTs: 0,
  fps: 0,
  assets: {},
  pendingUpgrades: 0,
  choosingUpgrade: false,
  grantedCombatUpgrades: 0,
  cameraX: 0,
  cameraY: 0,
};

/** Увеличивается при каждом disconnectCoop — чтобы игнорировать отложенный onClose после смены комнаты. */
let coopSessionGeneration = 0;

const PERK_TO_STAT = {
  armor_mastery: "armor",
  reach_mastery: "range",
  damage_mastery: "damage",
  lifesteal_mastery: "lifesteal",
  attack_speed_mastery: "attackSpeed",
  move_speed_mastery: "moveSpeed",
  vital_guard: "armor",
  blood_oath: "lifesteal",
  battle_tempo: "attackSpeed",
  trigger_focus: "attackSpeed",
  marked_prey: "damage",
  ghost_step: "moveSpeed",
  critical_line: "damage",
  stone_skin: "armor",
  storm_pulse: "attackSpeed",
  frost_shell: "armor",
  fire_brand: "damage",
  grace_step: "moveSpeed",
  spirit_strike: "damage",
  control_field: "range",
  execute_strike: "damage",
  chain_reach: "range",
  quick_lunge: "moveSpeed",
  totem_rhythm: "attackSpeed",
  siphon_link: "lifesteal",
  piercing_volley: "range",
  war_cry: "damage",
};

function getRaceDef() {
  return RACE_DEFS.find((r) => r.id === state.raceId) ?? null;
}

function getClassBaseStats() {
  return CLASS_BASE_STATS[state.heroClass] ?? { hp: 120, combatRole: "melee" };
}

function getBranchDefs() {
  return SUBCLASS_BRANCHES[state.heroClass] ?? [];
}

function selectedBranchDef() {
  return getBranchDefs().find((b) => b.id === state.subclassId) ?? null;
}

function getBuildStats() {
  const raceMods = getRaceDef()?.modifiers ?? {};
  const classStats = getClassBaseStats();
  const branch = selectedBranchDef();
  const focus = branch?.focus ?? null;

  const ranks = {
    armor: 0,
    range: 0,
    damage: 0,
    lifesteal: 0,
    attackSpeed: 0,
    moveSpeed: 0,
  };
  for (const [id, count] of Object.entries(state.perkStacks)) {
    const key = PERK_TO_STAT[id];
    if (key && key in ranks) ranks[key] += count;
  }

  const focusBonus = (key) => (focus === key ? 0.08 : 0);

  return {
    maxHp: Math.round((classStats.hp ?? 120) * (raceMods.hp ?? 1) * (1 + ranks.armor * 0.03)),
    armor: (classStats.armor ?? 0) + (raceMods.armor ?? 0) + ranks.armor * 0.03 + focusBonus("armor"),
    damageMul:
      (raceMods.damage ?? 1)
      * (1 + ranks.damage * 0.08 + focusBonus("damage"))
      * (state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "damageBurst" ? 1.25 : 1),
    rangeMul: 1 + ranks.range * 0.08 + focusBonus("range"),
    lifesteal:
      (raceMods.lifesteal ?? 0)
      + ranks.lifesteal * 0.05
      + (state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "graceAura" ? 0.06 : 0),
    attackSpeedMul:
      (raceMods.attackSpeed ?? 1)
      * (1 + ranks.attackSpeed * 0.08 + focusBonus("attackSpeed"))
      * (state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "attackBurst" ? 1.35 : 1),
    moveSpeedMul:
      (raceMods.moveSpeed ?? 1)
      * (1 + ranks.moveSpeed * 0.07 + focusBonus("moveSpeed"))
      * (state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "evasionBurst" ? 1.2 : 1),
    evasion:
      (raceMods.evasion ?? 0)
      + (state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "evasionBurst" ? 0.35 : 0),
    xpMul: raceMods.xpGain ?? 1,
    baseChainTargets: classStats.chainTargets ?? 0,
    activeChainBonus: state.skillActive && CLASS_ACTIVE_SKILLS[state.heroClass]?.effect === "chainBurst" ? 2 : 0,
  };
}

function buildClassButtons() {
  if (!classButtonsEl) return;
  classButtonsEl.innerHTML = "";
  for (const def of HERO_CLASSES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "class-btn";
    btn.dataset.class = def.id;
    btn.innerHTML = `<strong>${def.name}</strong><small>${def.tagline}</small>`;
    btn.addEventListener("click", () => afterClassChosen(def.id));
    classButtonsEl.appendChild(btn);
  }
}

function buildRaceButtons() {
  if (!raceButtonsEl) return;
  raceButtonsEl.innerHTML = "";
  for (const race of RACE_DEFS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "race-btn";
    btn.dataset.race = race.id;
    btn.innerHTML = `<strong>${race.name}</strong><small>${race.passive}</small>`;
    btn.addEventListener("click", () => {
      state.raceId = race.id;
      for (const el of raceButtonsEl.querySelectorAll(".race-btn")) {
        el.style.outline = el.dataset.race === race.id ? "2px solid #e2c27a" : "none";
      }
    });
    raceButtonsEl.appendChild(btn);
  }
}

function buildBranchButtons() {
  if (!branchButtonsEl) return;
  branchButtonsEl.innerHTML = "";
  for (const branch of getBranchDefs()) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "branch-btn";
    btn.dataset.branch = branch.id;
    btn.innerHTML = `<strong>${branch.name}</strong><small>Фокус: ${branch.focus}</small>`;
    btn.addEventListener("click", () => {
      state.subclassId = branch.id;
      for (const el of branchButtonsEl.querySelectorAll(".branch-btn")) {
        el.style.outline = el.dataset.branch === branch.id ? "2px solid #e2c27a" : "none";
      }
      if (state.raceId && state.heroClass && state.subclassId) {
        completeCharacterSetup();
      }
    });
    branchButtonsEl.appendChild(btn);
  }
}

function getCombatRole() {
  return combatRoleForClass(state.heroClass);
}

function getCharacterLevel() {
  if (!state.heroClass) return 1;
  const stacks = Object.values(state.perkStacks).reduce((acc, v) => acc + v, 0);
  return 1 + stacks;
}

function getXpProgress() {
  const step = PROGRESSION_CONFIG.experiencePerUpgrade;
  const cap = PROGRESSION_CONFIG.upgradesBeforeBoss;
  const earned = Math.min(cap, Math.floor(state.experience / step));
  if (earned >= cap) {
    return { xp: state.experience, xpToNext: 0 };
  }
  const nextThreshold = (earned + 1) * step;
  return {
    xp: state.experience,
    xpToNext: Math.max(0, nextThreshold - state.experience),
  };
}

function activePlayers() {
  if (state.player2) {
    return [state.player, state.player2].filter(Boolean);
  }
  return state.player ? [state.player] : [];
}

function disconnectCoop() {
  coopSessionGeneration += 1;
  state.guestInputCapture?.dispose();
  state.guestInputCapture = null;
  state.coopConn?.close();
  state.coopConn = null;
  state.coopRole = "solo";
  state.coopSelfId = null;
  state.coopPlayers = [];
  state.coopReady = false;
  state.coopCanStart = false;
  state.coopStarted = false;
  state.coopActiveGuestId = null;
  state.coopGuestConnected = false;
  state.guestInput = null;
  state.guestSnapshot = null;
  if (coopStatusEl) coopStatusEl.textContent = "";
  renderLobbyPlayers();
  syncLobbyButtons();
}

function snapshotForGuest() {
  if (!state.started) {
    return {
      idle: true,
      phase: state.runPhase,
      text: "Хост ещё не начал бой. Открой пролог и нажми «В бой».",
      characterLevel: getCharacterLevel(),
      heroClass: state.heroClass,
    };
  }
  const players = activePlayers();
  return {
    idle: false,
    started: state.started,
    ended: state.ended,
    result: state.result,
    elapsed: state.elapsedSeconds,
    level: state.level,
    wave: state.spawner?.currentWaveId ?? "-",
    kills: state.kills,
    experience: state.experience,
    heroClass: state.heroClass,
    characterLevel: getCharacterLevel(),
    players: players.map((p) => ({
      x: p.x,
      y: p.y,
      hp: p.hp,
      maxHp: p.maxHp,
      combatStyle: p.combatStyle,
      facingX: p.facingX,
      facingY: p.facingY,
      swingTimeLeft: p.swingTimeLeft,
      jumpTimeLeft: p.jumpTimeLeft,
      coopPlayerIndex: p.coopPlayerIndex ?? 0,
    })),
    enemies: state.enemies.map((e) => ({
      typeId: e.typeId,
      netId: e.netId,
      x: e.x,
      y: e.y,
      hp: e.hp,
      dead: e.dead,
    })),
    projectiles: state.projectiles
      .filter((p) => !p.dead)
      .map((p) => ({ x: p.x, y: p.y, r: p.radius })),
  };
}

function broadcastCoopIfHost() {
  if (state.coopRole !== "host" || !state.coopConn?.ready || !state.coopStarted) return;
  const now = Date.now();
  if (now - state.coopLastSendMs < 50) return;
  state.coopLastSendMs = now;
  state.coopConn.send({ type: "state", payload: snapshotForGuest() });
}

function showClassPanel() {
  disconnectCoop();
  state.runPhase = "introPickClass";
  state.started = false;
  state.story = null;
  state.storyId = null;
  state.raceId = null;
  state.heroClass = null;
  state.subclassId = null;
  state.perkStacks = {};
  state.gainedPerks = [];
  state.pendingUpgrades = 0;
  state.choosingUpgrade = false;
  state.lastUpgrade = "";
  state.skillCooldownLeft = 0;
  state.skillDurationLeft = 0;
  state.skillActive = false;
  state.skillRequested = false;
  state.remainingLives = 0;
  if (introClassBlurb) introClassBlurb.textContent = "";
  classPanel.classList.remove("hidden");
  introPanel.classList.add("hidden");
  intermissionPanel.classList.add("hidden");
  upgradePanel.classList.add("hidden");
  battleBtn.disabled = true;
  state.player2 = null;
  state.guestInput = null;
  buildRaceButtons();
  buildClassButtons();
  buildBranchButtons();
}

function afterClassChosen(heroClass) {
  state.heroClass = heroClass;
  state.subclassId = null;
  buildBranchButtons();
  if (!state.raceId) {
    if (introClassBlurb) introClassBlurb.textContent = "Сначала выбери расу.";
    return;
  }
}

function completeCharacterSetup() {
  if (!state.raceId || !state.heroClass || !state.subclassId) return;
  state.story = pickRandomStory();
  state.storyId = state.story.id;
  introTextEl.textContent = state.story.introText;
  if (introClassBlurb) {
    const raceName = getRaceDef()?.name ?? "";
    const className = getHeroClass(state.heroClass)?.name ?? "";
    const branchName = selectedBranchDef()?.name ?? "";
    introClassBlurb.textContent = `${raceName} · ${className} · ${branchName}`;
  }
  classPanel.classList.add("hidden");
  introPanel.classList.add("hidden");
  battleBtn.disabled = true;
  state.runPhase = "introPickStartingFeat";
  state.pendingUpgrades = 1 + (getRaceDef()?.modifiers?.bonusStartPerks ?? 0);
  state.choosingUpgrade = true;
  renderUpgradePanel();
}

function finalizeUpgradeFlowIfComplete() {
  if (state.pendingUpgrades > 0) return;
  state.choosingUpgrade = false;
  upgradePanel.classList.add("hidden");
  upgradeOptionsEl.innerHTML = "";
  if (state.runPhase === "introPickStartingFeat") {
    introPanel.classList.remove("hidden");
    battleBtn.disabled = false;
    state.runPhase = "introLore";
  } else if (state.runPhase === "featPickBeforeL2") {
    beginLevel2CombatAfterFeats();
  }
}

function hideIntro() {
  introPanel.classList.add("hidden");
}

function stackForRole(role) {
  const id = perkIdForRole(getCombatRole(), role);
  if (!id) return 0;
  return state.perkStacks[id] ?? 0;
}

function getAttackStats() {
  const build = getBuildStats();
  const rapidFireStacks = Math.min(
    stackForRole("rapid"),
    PROGRESSION_CONFIG.maxRapidFireStacks
  );
  const cooldownBase = ATTACK_CONFIG.cooldown
    * Math.pow(PROGRESSION_CONFIG.rapidFireCooldownMultiplier, rapidFireStacks)
    / build.attackSpeedMul;
  const powerStacks = stackForRole("power");
  const powerBonus = powerStacks * PROGRESSION_CONFIG.powerShotDamageBonus * build.damageMul;
  if (getCombatRole() === "ranged") {
    const cooldown = cooldownBase * 1.12;
    const damage = ATTACK_CONFIG.rangedProjectileDamage * build.damageMul + powerBonus;
    return { cooldown, damage, range: ATTACK_CONFIG.meleeRange * build.rangeMul };
  }
  const reachStacks = Math.min(
    stackForRole("reach"),
    PROGRESSION_CONFIG.maxReachStacks
  );
  const range = (ATTACK_CONFIG.meleeRange + reachStacks * PROGRESSION_CONFIG.reachBonusPerStack) * build.rangeMul;
  const cooldown = cooldownBase;
  const damage = ATTACK_CONFIG.meleeDamage * build.damageMul + powerBonus;
  return { cooldown, damage, range };
}

function getPerkListText() {
  if (state.gainedPerks.length === 0) {
    return "—";
  }
  return state.gainedPerks
    .map((perkId) => {
      const perk = PROGRESSION_CONFIG.perks.find((item) => item.id === perkId);
      const stacks = state.perkStacks[perkId] ?? 0;
      return `${perk?.name ?? perkId} x${stacks}`;
    })
    .join(", ");
}

function buildUpgradeChoices() {
  const pool = perksForClass(state.heroClass);
  const branch = selectedBranchDef();
  const branchIds = new Set(branch?.perkIds ?? []);
  const prioritized = pool.filter((p) => branchIds.has(p.id));
  const fallback = pool.filter((p) => !branchIds.has(p.id));
  const weighted = [...prioritized, ...fallback];
  const unique = weighted.filter((item, idx) => weighted.findIndex((p) => p.id === item.id) === idx);
  const shuffled = [...unique].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, shuffled.length));
}

function renderUpgradePanel() {
  if (!state.choosingUpgrade || state.pendingUpgrades <= 0) {
    upgradePanel.classList.add("hidden");
    upgradeOptionsEl.innerHTML = "";
    return;
  }

  if (upgradeTitleEl && upgradeDescEl) {
    if (state.runPhase === "introPickStartingFeat") {
      upgradeTitleEl.textContent = "Стартовая черта";
      upgradeDescEl.textContent = "Выбери одну черту 1-го уровня для этого класса. Пролог откроется после выбора.";
    } else if (state.runPhase === "featPickBeforeL2") {
      upgradeTitleEl.textContent = "Новый уровень — черты";
      upgradeDescEl.textContent = `Накопленные невыбранные повышения. Осталось черт: ${state.pendingUpgrades}. `
        + "Можно брать одну и ту же черту повторно.";
    } else {
      upgradeTitleEl.textContent = "Черта";
      upgradeDescEl.textContent = "Выбери одну черту.";
    }
  }

  const choices = buildUpgradeChoices();
  upgradePanel.classList.remove("hidden");
  upgradeOptionsEl.innerHTML = "";
  for (const perk of choices) {
    const button = document.createElement("button");
    button.className = "upgrade-btn";
    button.type = "button";
    const stack = (state.perkStacks[perk.id] ?? 0) + 1;
    button.innerHTML = `${perk.name} <small>${perk.description}. Следующий ранг: ×${stack}</small>`;
    button.addEventListener("click", () => {
      applyUpgrade(perk.id);
      state.pendingUpgrades = Math.max(0, state.pendingUpgrades - 1);
      if (state.pendingUpgrades <= 0) {
        state.choosingUpgrade = false;
        renderUpgradePanel();
        finalizeUpgradeFlowIfComplete();
      } else {
        state.choosingUpgrade = true;
        renderUpgradePanel();
      }
    });
    upgradeOptionsEl.appendChild(button);
  }
}

function applyUpgrade(perkId = null) {
  const pool = perksForClass(state.heroClass);
  if (pool.length === 0) {
    return;
  }
  const picked = perkId
    ? pool.find((item) => item.id === perkId) ?? pool[Math.floor(Math.random() * pool.length)]
    : pool[Math.floor(Math.random() * pool.length)];
  const oldStack = state.perkStacks[picked.id] ?? 0;
  state.perkStacks[picked.id] = oldStack + 1;
  if (!state.gainedPerks.includes(picked.id)) {
    state.gainedPerks.push(picked.id);
  }
  state.lastUpgrade = `${picked.name} (${picked.description})`;
}

function startLevel1Combat() {
  const build = getBuildStats();
  state.runPhase = "fighting";
  state.level = 1;
  state.started = true;
  state.ended = false;
  state.result = "Бой";
  state.intermissionShown = false;
  state.elapsedSeconds = 0;
  state.kills = 0;
  state.score = 0;
  state.experience = 0;
  state.enemies = [];
  state.projectiles = [];
  if (state.coopRole === "host" && state.coopGuestConnected) {
    state.player = new Player(WORLD.width / 2 - 70, WORLD.height / 2, 0);
    state.player2 = new Player(WORLD.width / 2 + 70, WORLD.height / 2, 1);
    state.player2.combatStyle = getCombatRole() === "ranged" ? "ranged" : "melee";
    state.player2.maxHp = build.maxHp;
    state.player2.hp = build.maxHp;
    state.player2.speedMultiplier = build.moveSpeedMul;
    state.player2.damageReduction = Math.min(0.75, build.armor);
    state.player2.evasionChance = Math.min(0.6, build.evasion);
    state.guestInput = new Set();
  } else {
    state.player = new Player(WORLD.width / 2, WORLD.height / 2, 0);
    state.player2 = null;
    state.guestInput = null;
  }
  state.player.combatStyle = getCombatRole() === "ranged" ? "ranged" : "melee";
  state.player.maxHp = build.maxHp;
  state.player.hp = build.maxHp;
  state.player.speedMultiplier = build.moveSpeedMul;
  state.player.damageReduction = Math.min(0.75, build.armor);
  state.player.evasionChance = Math.min(0.6, build.evasion);
  state.input ??= Player.setupInput();
  state.remainingLives = getRaceDef()?.modifiers?.extraLives ?? 0;
  const classSkill = CLASS_ACTIVE_SKILLS[state.heroClass];
  state.skillCooldownLeft = classSkill?.cooldown ?? 0;
  state.skillDurationLeft = 0;
  state.skillActive = false;
  state.spawner = new WaveSpawner({ waves: WAVES_LEVEL_1, bossTypeId: "tavern_guard_boss" });
  state.cameraX = Math.max(0, Math.min(WORLD.width - ARENA.width, state.player.x - ARENA.width / 2));
  state.cameraY = Math.max(0, Math.min(WORLD.height - ARENA.height, state.player.y - ARENA.height / 2));
  state.pendingUpgrades = 0;
  state.choosingUpgrade = false;
  state.grantedCombatUpgrades = 0;
  renderUpgradePanel();
  restartBtn.disabled = true;
}

function beginRun() {
  hideIntro();
  startLevel1Combat();
}

function showIntermissionLevel2() {
  state.runPhase = "intermissionLevel2";
  state.intermissionShown = true;
  intermissionTextEl.textContent = `${state.story.level2Text}\n\n${state.story.missionText}`;
  intermissionPanel.classList.remove("hidden");
}

function beginLevel2CombatAfterFeats() {
  const build = getBuildStats();
  state.runPhase = "fightingLevel2";
  state.level = 2;
  state.started = true;
  state.ended = false;
  state.result = "Бой (акт II)";
  state.enemies = [];
  state.projectiles = [];
  if (state.player) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp);
    state.player.attackCooldownLeft = 0;
    state.player.swingTimeLeft = 0;
    state.player.combatStyle = getCombatRole() === "ranged" ? "ranged" : "melee";
    state.player.speedMultiplier = build.moveSpeedMul;
    state.player.damageReduction = Math.min(0.75, build.armor);
    state.player.evasionChance = Math.min(0.6, build.evasion);
  }
  if (state.player2) {
    state.player2.hp = Math.min(state.player2.maxHp, state.player2.hp);
    state.player2.attackCooldownLeft = 0;
    state.player2.swingTimeLeft = 0;
    state.player2.combatStyle = getCombatRole() === "ranged" ? "ranged" : "melee";
    state.player2.speedMultiplier = build.moveSpeedMul;
    state.player2.damageReduction = Math.min(0.75, build.armor);
    state.player2.evasionChance = Math.min(0.6, build.evasion);
  }
  state.spawner.configure({ waves: WAVES_LEVEL_2, bossTypeId: "dock_warden_boss" });
  state.experience = 0;
  state.grantedCombatUpgrades = 0;
  restartBtn.disabled = true;
}

function onContinueFromIntermission() {
  intermissionPanel.classList.add("hidden");
  if (state.pendingUpgrades > 0) {
    state.runPhase = "featPickBeforeL2";
    state.choosingUpgrade = true;
    renderUpgradePanel();
  } else {
    beginLevel2CombatAfterFeats();
  }
}

function getWaveHudLabel() {
  if (!state.spawner) {
    return "-";
  }
  const id = state.spawner.currentWaveId;
  return `L${state.level}-${id}`;
}

function renderArenaBackground(levelOverride) {
  const lv = levelOverride ?? state.level;
  const key = lv >= 2 ? "docks_bg" : "tavern_bg";
  const img = state.assets[key];
  if (img) {
    ctx.drawImage(img, 0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = lv >= 2 ? "rgba(12, 18, 28, 0.22)" : "rgba(25, 16, 18, 0.18)";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    return;
  }

  ctx.fillStyle = lv >= 2 ? "#141c28" : "#241a1a";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = lv >= 2 ? "#1f2a38" : "#38272a";
  for (let y = 0; y < WORLD.height; y += 30) {
    ctx.fillRect(0, y, WORLD.width, 2);
  }

  ctx.fillStyle = "#4a3022";
  ctx.fillRect(18, 18, 150, 40);
  ctx.fillRect(WORLD.width - 190, 18, 170, 35);
  ctx.fillRect(WORLD.width - 210, WORLD.height - 52, 190, 32);
}

function updateCamera() {
  if (!state.player) return;
  const deadZoneX = ARENA.width * 0.24;
  const deadZoneY = ARENA.height * 0.24;
  let targetX = state.cameraX;
  let targetY = state.cameraY;
  const px = state.player.x - state.cameraX;
  const py = state.player.y - state.cameraY;
  if (px < deadZoneX) targetX = state.player.x - deadZoneX;
  else if (px > ARENA.width - deadZoneX) targetX = state.player.x - (ARENA.width - deadZoneX);
  if (py < deadZoneY) targetY = state.player.y - deadZoneY;
  else if (py > ARENA.height - deadZoneY) targetY = state.player.y - (ARENA.height - deadZoneY);
  targetX = Math.max(0, Math.min(WORLD.width - ARENA.width, targetX));
  targetY = Math.max(0, Math.min(WORLD.height - ARENA.height, targetY));
  state.cameraX += (targetX - state.cameraX) * 0.18;
  state.cameraY += (targetY - state.cameraY) * 0.18;
}

function updateProjectiles(deltaSeconds) {
  for (const p of state.projectiles) {
    if (p.dead) continue;
    p.x += p.vx * deltaSeconds;
    p.y += p.vy * deltaSeconds;
    p.ttl -= deltaSeconds;
    if (
      p.ttl <= 0
      || p.x < -40 || p.x > WORLD.width + 40
      || p.y < -40 || p.y > WORLD.height + 40
    ) {
      p.dead = true;
    }
  }
}

function drawInFieldHints() {
  const skill = CLASS_ACTIVE_SKILLS[state.heroClass];
  const boxX = 14;
  const boxY = ARENA.height - 88;
  const boxW = 270;
  const boxH = 74;
  ctx.save();
  ctx.fillStyle = "rgba(12, 10, 16, 0.72)";
  ctx.strokeStyle = "#6f5b49";
  ctx.lineWidth = 1;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = "#f3e7d4";
  ctx.font = "12px Segoe UI";
  ctx.textAlign = "left";
  ctx.fillText("WASD / ↑↓←→  Движение", boxX + 10, boxY + 20);
  ctx.fillText("Space  Прыжок", boxX + 10, boxY + 38);
  ctx.fillText("E  Активный скилл", boxX + 10, boxY + 56);

  const cX = boxX + boxW - 44;
  const cY = boxY + 37;
  const radius = 20;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(180, 160, 130, 0.55)";
  ctx.lineWidth = 5;
  ctx.arc(cX, cY, radius, 0, Math.PI * 2);
  ctx.stroke();

  const cdTotal = skill?.cooldown ?? 1;
  const cdLeft = Math.max(0, state.skillCooldownLeft);
  const ratio = cdTotal > 0 ? Math.min(1, cdLeft / cdTotal) : 0;
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * (1 - ratio);
  ctx.beginPath();
  ctx.strokeStyle = state.skillActive ? "#9be16d" : "#e2c27a";
  ctx.lineWidth = 5;
  ctx.arc(cX, cY, radius, start, end);
  ctx.stroke();

  ctx.fillStyle = "#fff4df";
  ctx.font = "bold 12px Segoe UI";
  ctx.textAlign = "center";
  const label = state.skillActive
    ? "ON"
    : `${Math.ceil(cdLeft)}`;
  ctx.fillText(label, cX, cY + 4);
  ctx.restore();
}

function update(deltaSeconds) {
  if (!state.started || state.ended) {
    return;
  }
  if (state.choosingUpgrade) {
    return;
  }
  if (state.runPhase === "intermissionLevel2") {
    state.elapsedSeconds += deltaSeconds;
    return;
  }

  state.elapsedSeconds += deltaSeconds;
  const skill = CLASS_ACTIVE_SKILLS[state.heroClass];
  if (skill) {
    state.skillCooldownLeft = Math.max(0, state.skillCooldownLeft - deltaSeconds);
    state.skillDurationLeft = Math.max(0, state.skillDurationLeft - deltaSeconds);
    state.skillActive = state.skillDurationLeft > 0;
    if (state.skillRequested && state.skillCooldownLeft <= 0) {
      state.skillRequested = false;
      state.skillDurationLeft = skill.duration;
      state.skillCooldownLeft = skill.cooldown;
      state.skillActive = true;
    }
  } else {
    state.skillRequested = false;
  }
  const build = getBuildStats();
  const playersAlive = activePlayers();
  for (const pl of playersAlive) {
    pl.speedMultiplier = build.moveSpeedMul;
    pl.damageReduction = Math.min(0.75, build.armor + (state.skillActive && skill?.effect === "armorBurst" ? 0.25 : 0));
    pl.evasionChance = Math.min(0.6, build.evasion);
  }
  state.player.update(deltaSeconds, state.input, WORLD);
  if (state.player2 && state.guestInput) {
    state.player2.update(deltaSeconds, state.guestInput, WORLD);
  }

  if (state.heroClass === "priest") {
    for (const pl of playersAlive) {
      pl.hp = Math.min(pl.maxHp, pl.hp + (CLASS_BASE_STATS.priest.selfRegen ?? 0) * deltaSeconds);
    }
  }
  state.spawner.update(deltaSeconds, state.elapsedSeconds, state.enemies);

  const attackStats = getAttackStats();
  let hitEvents = [];

  if (getCombatRole() === "ranged") {
    updateProjectiles(deltaSeconds);
    for (const pl of playersAlive) {
      const spawn = pl.tryRangedAttack(state.enemies, attackStats);
      if (spawn) {
        const pierceStacks = Math.min(
          stackForRole("pierce"),
          PROGRESSION_CONFIG.maxPierceStacks
        );
        spawn.pierceCount = pierceStacks;
        state.projectiles.push(spawn);
      }
    }
    const { hitEvents: projHits } = applyProjectileHits(state.projectiles, state.enemies);
    hitEvents = projHits.map((h) => ({
      enemy: h.enemy,
      damage: h.damage,
      owner: h.owner,
    }));
  } else {
    for (const pl of playersAlive) {
      const meleeHits = pl.tryMeleeAttack(state.enemies, attackStats);
      for (const hit of meleeHits) {
        hit.enemy.applyDamage(hit.damage);
      }
      hitEvents.push(...meleeHits);
    }
  }

  for (const enemy of state.enemies) {
    if (!enemy.dead) {
      enemy.update(deltaSeconds, playersAlive);
    }
  }

  const splashStacks = stackForRole("splash");
  if (splashStacks > 0) {
    const splashMult = getCombatRole() === "ranged"
      ? PROGRESSION_CONFIG.rangedSplashDamageMultiplier
      : PROGRESSION_CONFIG.splashDamageMultiplier;
    const splashRadius = getCombatRole() === "ranged"
      ? PROGRESSION_CONFIG.rangedSplashRadius
      : PROGRESSION_CONFIG.splashRadius;
    for (const hitEvent of hitEvents) {
      const splashDamage = hitEvent.damage * splashMult * splashStacks;
      for (const enemy of state.enemies) {
        if (enemy.dead || enemy === hitEvent.enemy) continue;
        if (!circlesWithinRadius(
          hitEvent.enemy.x,
          hitEvent.enemy.y,
          enemy.x,
          enemy.y,
          splashRadius
        )) {
          continue;
        }
        enemy.applyDamage(splashDamage);
      }
    }
  }
  const lifeStacks = stackForRole("lifesteal");
  if ((lifeStacks > 0 || build.lifesteal > 0) && hitEvents.length > 0) {
    const byOwner = new Map();
    for (const ev of hitEvents) {
      const pl = ev.owner;
      if (!pl) continue;
      byOwner.set(pl, (byOwner.get(pl) ?? 0) + ev.damage);
    }
    for (const [pl, dmg] of byOwner) {
      const heal = dmg * ((PROGRESSION_CONFIG.lifestealRatio * lifeStacks) + build.lifesteal);
      pl.hp = Math.min(pl.maxHp, pl.hp + heal);
    }
  }
  applyEnemyContactDamage(playersAlive, state.enemies, GAME_CONFIG.contactTickSeconds);

  const defeatedEnemies = state.enemies.filter((enemy) => enemy.dead);
  const aliveBefore = state.enemies.length;
  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
  state.projectiles = state.projectiles.filter((p) => !p.dead);
  const killsThisFrame = aliveBefore - state.enemies.length;
  const xpThisFrameBase = defeatedEnemies.reduce((sum, enemy) => {
    const enemyDef = ENEMY_TYPES[enemy.typeId];
    return sum + (enemyDef?.score ?? 1);
  }, 0);
  const xpThisFrame = Math.round(xpThisFrameBase * build.xpMul);
  state.score += killsThisFrame;
  state.kills += killsThisFrame;
  state.experience += xpThisFrame;
  if (xpThisFrame > 0) {
    const earnedByXp = Math.floor(state.experience / PROGRESSION_CONFIG.experiencePerUpgrade);
    const cappedEarned = Math.min(PROGRESSION_CONFIG.upgradesBeforeBoss, earnedByXp);
    if (cappedEarned > state.grantedCombatUpgrades) {
      const grant = cappedEarned - state.grantedCombatUpgrades;
      state.grantedCombatUpgrades = cappedEarned;
      state.pendingUpgrades += grant;
    }
  }

  if (
    !state.ended
    && state.pendingUpgrades > 0
    && (state.runPhase === "fighting" || state.runPhase === "fightingLevel2")
  ) {
    state.choosingUpgrade = true;
    renderUpgradePanel();
    return;
  }

  for (const pl of playersAlive) {
    if (pl.hp <= 0) {
      if (state.remainingLives > 0) {
        state.remainingLives -= 1;
        pl.hp = Math.ceil(pl.maxHp * 0.45);
      } else {
        pl.hp = 0;
        state.ended = true;
        state.result = "Поражение";
        break;
      }
    }
  }

  const waves = state.level === 1 ? WAVES_LEVEL_1 : WAVES_LEVEL_2;
  const finalWave = waves[waves.length - 1];
  const padding = state.level === 1 ? GAME_CONFIG.runEndPadding : GAME_CONFIG.runEndPaddingLevel2;
  const outOfWaveTime = state.elapsedSeconds > finalWave.end + padding;
  const bossWasScheduled = state.spawner.isBossScheduled(state.elapsedSeconds);
  const bossAlive = state.spawner.hasBossAlive(state.enemies);

  if (!state.ended && state.level === 1 && bossWasScheduled && !bossAlive && outOfWaveTime && !state.intermissionShown) {
    showIntermissionLevel2();
    return;
  }

  if (!state.ended && state.level === 2 && bossWasScheduled && !bossAlive && outOfWaveTime) {
    state.ended = true;
    state.result = "Победа";
  }

  if (state.ended) {
    restartBtn.disabled = false;
  }
}

function drawProjectiles() {
  for (const p of state.projectiles) {
    if (p.dead) continue;
    const sprite = state.assets.projectile;
    if (sprite) {
      const r = p.radius * 2.4;
      ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
    } else {
      ctx.beginPath();
      ctx.fillStyle = "#e8f4ff";
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function draw() {
  ctx.save();
  ctx.translate(-state.cameraX, -state.cameraY);
  renderArenaBackground();

  if (state.player) {
    for (const enemy of state.enemies) {
      enemy.draw(ctx, state.assets);
    }
    drawProjectiles();
    for (const pl of activePlayers()) {
      pl.draw(ctx, state.assets);
    }
  }

  ctx.restore();
  drawInFieldHints();

  if (state.ended) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
    ctx.fillStyle = "#f6e6c9";
    ctx.font = "bold 46px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(state.result, ARENA.width / 2, ARENA.height / 2 - 10);
    ctx.font = "20px Segoe UI";
    ctx.fillText("Нажми Restart, чтобы начать заново", ARENA.width / 2, ARENA.height / 2 + 30);
    return;
  }
}

function drawGuestFromSnapshot() {
  const snap = state.guestSnapshot;
  if (!snap) {
    renderArenaBackground(1);
    ctx.fillStyle = "#e8dcc4";
    ctx.font = "22px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("Подключение к хосту…", ARENA.width / 2, ARENA.height / 2);
    return;
  }
  if (snap.idle) {
    renderArenaBackground(1);
    ctx.fillStyle = "#e8dcc4";
    ctx.font = "20px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(snap.text ?? "Ожидание хоста…", ARENA.width / 2, ARENA.height / 2 - 10);
    return;
  }
  renderArenaBackground(snap.level ?? 1);
  for (const d of snap.enemies ?? []) {
    if (d.dead) continue;
    const en = new Enemy(d.typeId, d.x, d.y);
    en.hp = d.hp;
    en.dead = false;
    en.draw(ctx, state.assets);
  }
  for (const pr of snap.projectiles ?? []) {
    ctx.beginPath();
    ctx.fillStyle = "#e8f4ff";
    ctx.arc(pr.x, pr.y, pr.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const pd of snap.players ?? []) {
    const ghost = new Player(pd.x, pd.y, pd.coopPlayerIndex ?? 0);
    ghost.hp = pd.hp;
    ghost.maxHp = pd.maxHp;
    ghost.combatStyle = pd.combatStyle ?? "melee";
    ghost.facingX = pd.facingX ?? 1;
    ghost.facingY = pd.facingY ?? 0;
    ghost.swingTimeLeft = pd.swingTimeLeft ?? 0;
    ghost.jumpTimeLeft = pd.jumpTimeLeft ?? 0;
    ghost.draw(ctx, state.assets);
  }
  if (snap.ended) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
    ctx.fillStyle = "#f6e6c9";
    ctx.font = "bold 46px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(snap.result ?? "", ARENA.width / 2, ARENA.height / 2 - 10);
  }
}

function stepGuestFrame(ts) {
  if (!state.lastTs) state.lastTs = ts;
  const deltaSeconds = Math.min(0.05, (ts - state.lastTs) / 1000);
  state.lastTs = ts;
  state.fps = 1 / Math.max(deltaSeconds, 0.0001);
  if (
    state.coopConn?.ready
    && state.guestInputCapture
    && state.coopStarted
    && state.coopSelfId === state.coopActiveGuestId
  ) {
    state.coopConn.send({
      type: "input",
      keys: state.guestInputCapture.snapshotKeys(),
    });
  }
  drawGuestFromSnapshot();
  const snap = state.guestSnapshot;
  const p0 = snap?.players?.[0];
  const p1 = snap?.players?.[1];
  const hpLabel = snap?.idle
    ? "—"
    : p0 && p1
      ? `${Math.ceil(p0.hp)}/${p0.maxHp} · ${Math.ceil(p1.hp)}/${p1.maxHp}`
      : p0
        ? `${Math.ceil(p0.hp)}/${p0.maxHp}`
        : "—";
  const snapXp = snap?.experience ?? 0;
  const xpStep = PROGRESSION_CONFIG.experiencePerUpgrade;
  const xpCap = PROGRESSION_CONFIG.upgradesBeforeBoss;
  const earnedXpUpgrades = Math.min(xpCap, Math.floor(snapXp / xpStep));
  const snapXpToNext = earnedXpUpgrades >= xpCap
    ? 0
    : Math.max(0, (earnedXpUpgrades + 1) * xpStep - snapXp);
  renderHud({
    hp: p0 ? Math.ceil(p0.hp) : 0,
    maxHp: p0?.maxHp ?? 0,
    hpLabel,
    className: getHeroClass(snap?.heroClass)?.name ?? "—",
    charLevel: snap?.characterLevel ?? 1,
    wave: snap?.wave ?? "-",
    enemies: snap?.enemies?.filter((e) => !e.dead).length ?? 0,
    kills: snap?.kills ?? 0,
    xp: snapXp,
    xpToNext: snapXpToNext,
    elapsed: snap?.elapsed ?? 0,
    fps: state.fps,
    status: snap?.result ?? "Гость",
    perks: "—",
    lastUpgrade: "—",
  });
}

function loop(ts) {
  if (state.coopRole === "guest") {
    stepGuestFrame(ts);
    requestAnimationFrame(loop);
    return;
  }
  if (!state.lastTs) state.lastTs = ts;
  const deltaSeconds = Math.min(0.05, (ts - state.lastTs) / 1000);
  state.lastTs = ts;
  state.fps = 1 / Math.max(deltaSeconds, 0.0001);

  update(deltaSeconds);
  updateCamera();
  draw();
  if (state.coopRole === "host") {
    broadcastCoopIfHost();
  }

  const pls = activePlayers();
  const hpLabel = pls.length > 1
    ? `${Math.ceil(pls[0].hp)}/${pls[0].maxHp} · ${Math.ceil(pls[1].hp)}/${pls[1].maxHp}`
    : undefined;
  const xpProgress = getXpProgress();
  renderHud({
    hp: state.player?.hp ?? 0,
    maxHp: state.player?.maxHp ?? 0,
    hpLabel,
    className: `${getRaceDef()?.name ?? "—"} / ${getHeroClass(state.heroClass)?.name ?? "—"} / ${selectedBranchDef()?.name ?? "—"}`,
    charLevel: getCharacterLevel(),
    wave: getWaveHudLabel(),
    enemies: state.enemies.length,
    kills: state.kills,
    xp: xpProgress.xp,
    xpToNext: xpProgress.xpToNext,
    elapsed: state.elapsedSeconds,
    fps: state.fps,
    status: state.skillActive
      ? `${state.result} · ${CLASS_ACTIVE_SKILLS[state.heroClass]?.name ?? "Скилл"} активен`
      : `${state.result} · ${CLASS_ACTIVE_SKILLS[state.heroClass]?.name ?? "Скилл"} CD ${Math.ceil(state.skillCooldownLeft)}s`,
    perks: getPerkListText(),
    lastUpgrade: state.lastUpgrade || `Жизни: ${state.remainingLives}`,
  });

  requestAnimationFrame(loop);
}

battleBtn.addEventListener("click", () => {
  beginRun();
});

continueBtn.addEventListener("click", () => {
  onContinueFromIntermission();
});

restartBtn.addEventListener("click", () => {
  state.ended = false;
  state.player = null;
  state.player2 = null;
  state.guestInput = null;
  disconnectCoop();
  state.enemies = [];
  state.projectiles = [];
  state.spawner = null;
  state.elapsedSeconds = 0;
  state.kills = 0;
  state.score = 0;
  state.experience = 0;
  state.perkStacks = {};
  state.gainedPerks = [];
  state.lastUpgrade = "";
  state.pendingUpgrades = 0;
  state.choosingUpgrade = false;
  state.grantedCombatUpgrades = 0;
  state.skillRequested = false;
  renderUpgradePanel();
  state.result = "Не начато";
  restartBtn.disabled = true;
  showClassPanel();
});

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "e") {
    state.skillRequested = true;
  }
});

draw();
renderHud({
  hp: 0,
  maxHp: 0,
  hpLabel: undefined,
  className: "—",
  charLevel: 1,
  wave: "-",
  enemies: 0,
  kills: 0,
  xp: 0,
  xpToNext: PROGRESSION_CONFIG.experiencePerUpgrade,
  elapsed: 0,
  fps: 0,
  status: "Готово",
  perks: "—",
  lastUpgrade: "—",
});
requestAnimationFrame(loop);

loadAssets().then((assets) => {
  state.assets = assets;
});

function getCoopUrl() {
  return (coopWsUrlInput?.value ?? "ws://127.0.0.1:8765").trim() || "ws://127.0.0.1:8765";
}

function getRoomId() {
  return (coopRoomIdInput?.value ?? "public").trim() || "public";
}

function getPlayerName() {
  return (coopPlayerNameInput?.value ?? "Player").trim() || "Player";
}

function isHost() {
  return state.coopRole === "host";
}

function isConnectedToLobby() {
  return Boolean(state.coopConn?.ready && (isHost() || state.coopRole === "guest"));
}

function renderLobbyPlayers() {
  if (!coopRoomPlayers) return;
  coopRoomPlayers.innerHTML = "";
  if (state.coopPlayers.length === 0) {
    const empty = document.createElement("p");
    empty.className = "coop-hint";
    empty.textContent = "Нет активной комнаты.";
    coopRoomPlayers.appendChild(empty);
    return;
  }
  for (const p of state.coopPlayers) {
    const row = document.createElement("div");
    row.className = "coop-url-row";
    const name = document.createElement("span");
    name.className = "coop-url-label";
    const marks = [];
    if (p.role === "host") marks.push("host");
    if (p.id === state.coopActiveGuestId && state.coopStarted) marks.push("input");
    name.textContent = marks.length ? `${p.name} (${marks.join(", ")})` : p.name;
    const status = document.createElement("code");
    status.className = "coop-url-value";
    status.textContent = p.role === "host"
      ? (state.coopStarted ? "в матче" : "готовит старт")
      : (p.ready ? "ready" : "ожидает");
    row.append(name, status);
    coopRoomPlayers.appendChild(row);
  }
}

function syncLobbyButtons() {
  if (coopReadyBtn) {
    const canToggleReady = isConnectedToLobby() && !isHost() && !state.coopStarted;
    coopReadyBtn.disabled = !canToggleReady;
    coopReadyBtn.textContent = state.coopReady ? "Не готов" : "Готов";
  }
  if (coopStartBtn) {
    coopStartBtn.disabled = !(isConnectedToLobby() && isHost() && state.coopCanStart && !state.coopStarted);
  }
}

function updateLobbyFromRoomState(msg) {
  state.coopRoomId = msg.roomId ?? state.coopRoomId;
  state.coopPlayers = Array.isArray(msg.players) ? msg.players : [];
  state.coopCanStart = Boolean(msg.canStart);
  state.coopStarted = Boolean(msg.started);
  state.coopActiveGuestId = msg.activeGuestId ?? null;
  const me = state.coopPlayers.find((p) => p.id === state.coopSelfId);
  state.coopReady = Boolean(me?.ready);
  state.coopRole = me?.role ?? state.coopRole;
  state.coopGuestConnected = state.coopPlayers.some((p) => p.role === "guest");

  if (state.started && !state.coopGuestConnected && state.player2) {
    state.player2 = null;
    state.guestInput = null;
  }

  renderLobbyPlayers();
  syncLobbyButtons();

  if (coopStatusEl) {
    if (state.coopStarted) {
      coopStatusEl.textContent = `Матч запущен в комнате ${state.coopRoomId}.`;
    } else if (isHost()) {
      coopStatusEl.textContent = state.coopCanStart
        ? `Комната ${state.coopRoomId}: все готовы, можно запускать.`
        : `Комната ${state.coopRoomId}: ждём готовность всех гостей.`;
    } else {
      coopStatusEl.textContent = `Комната ${state.coopRoomId}: ${state.coopReady ? "вы готовы" : "нажмите Готов"}.`;
    }
  }
}

function handleLobbyMessage(msg) {
  if (!msg || typeof msg.type !== "string") return;
  if (msg.type === "joined") {
    state.coopSelfId = msg.selfId ?? null;
    state.coopRoomId = msg.roomId ?? state.coopRoomId;
    state.coopRole = msg.role === "host" ? "host" : "guest";
    state.coopStarted = false;
    state.coopReady = false;
    state.guestSnapshot = null;
    if (state.coopRole === "guest") {
      state.guestInputCapture = attachGuestKeyCapture();
    }
    if (coopStatusEl) {
      coopStatusEl.textContent = `Вошли в комнату ${state.coopRoomId} как ${state.coopRole}.`;
    }
    syncLobbyButtons();
    return;
  }
  if (msg.type === "roomState") {
    updateLobbyFromRoomState(msg);
    return;
  }
  if (msg.type === "matchStarted") {
    state.coopStarted = true;
    state.coopActiveGuestId = msg.activeGuestId ?? state.coopActiveGuestId;
    if (coopStatusEl) {
      coopStatusEl.textContent = `Матч в комнате ${msg.roomId ?? state.coopRoomId} запущен.`;
    }
    syncLobbyButtons();
    return;
  }
  if (msg.type === "state" && msg.payload && state.coopRole === "guest") {
    state.guestSnapshot = msg.payload;
    return;
  }
  if (msg.type === "input" && Array.isArray(msg.keys) && state.coopRole === "host") {
    state.guestInput = new Set(msg.keys.map((k) => String(k).toLowerCase()));
  }
}

if (coopJoinBtn) {
  coopJoinBtn.addEventListener("click", () => {
    disconnectCoop();
    const sessionAtConnect = coopSessionGeneration;
    const url = getCoopUrl();
    state.coopConn = connectCoop(url, {
      roomId: getRoomId(),
      name: getPlayerName(),
      onMessage: handleLobbyMessage,
      onOpen() {
        if (coopStatusEl) coopStatusEl.textContent = "Подключение к lobby relay…";
      },
      onClose(detail) {
        if (sessionAtConnect !== coopSessionGeneration) return;
        state.coopConn = null;
        state.coopRole = "solo";
        state.coopPlayers = [];
        state.coopCanStart = false;
        state.coopStarted = false;
        state.coopActiveGuestId = null;
        renderLobbyPlayers();
        syncLobbyButtons();
        if (coopStatusEl) {
          coopStatusEl.textContent = detail?.opened
            ? "Связь с lobby relay прервалась."
            : "Не удалось подключиться к lobby relay. Проверь ws/wss URL.";
        }
      },
    });
  });
}

if (coopReadyBtn) {
  coopReadyBtn.addEventListener("click", () => {
    if (!isConnectedToLobby() || isHost() || state.coopStarted) return;
    const nextReady = !state.coopReady;
    state.coopConn.send({ type: "setReady", ready: nextReady });
  });
}

if (coopStartBtn) {
  coopStartBtn.addEventListener("click", () => {
    if (!isConnectedToLobby() || !isHost() || !state.coopCanStart || state.coopStarted) return;
    state.coopConn.send({ type: "startMatch" });
  });
}

buildClassButtons();
showClassPanel();

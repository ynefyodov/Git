const hpEl = document.getElementById("hp-value");
const classEl = document.getElementById("class-value");
const levelEl = document.getElementById("level-value");
const waveEl = document.getElementById("wave-value");
const enemiesEl = document.getElementById("enemies-value");
const killsEl = document.getElementById("kills-value");
const xpEl = document.getElementById("xp-value");
const timeEl = document.getElementById("time-value");
const fpsEl = document.getElementById("fps-value");
const statusEl = document.getElementById("status-value");
const perksEl = document.getElementById("perks-value");
const upgradeEl = document.getElementById("upgrade-value");

export function renderHud(data) {
  if (data.hpLabel) {
    hpEl.textContent = data.hpLabel;
  } else {
    hpEl.textContent = `${Math.max(0, Math.ceil(data.hp))} / ${data.maxHp}`;
  }
  if (classEl) classEl.textContent = data.className ?? "—";
  if (levelEl) levelEl.textContent = `${data.charLevel ?? 1}`;
  waveEl.textContent = `${data.wave}`;
  enemiesEl.textContent = `${data.enemies}`;
  killsEl.textContent = `${data.kills}`;
  if (xpEl) {
    const xp = data.xp ?? 0;
    const xpToNext = data.xpToNext ?? 0;
    const threshold = xpToNext > 0 ? xp + xpToNext : xp;
    xpEl.textContent = `${xp}/${threshold}`;
  }
  timeEl.textContent = `${data.elapsed.toFixed(1)}s`;
  fpsEl.textContent = `${Math.round(data.fps)}`;
  statusEl.textContent = data.status;
  perksEl.textContent = data.perks;
  upgradeEl.textContent = data.lastUpgrade;
}

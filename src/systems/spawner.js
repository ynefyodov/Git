import { ENEMY_TYPES, WAVES_LEVEL_1, WORLD } from "../config.js";
import { Enemy } from "../entities/enemy.js";

function randomSpawnPoint() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * WORLD.width, y: -20 };
  if (side === 1) return { x: WORLD.width + 20, y: Math.random() * WORLD.height };
  if (side === 2) return { x: Math.random() * WORLD.width, y: WORLD.height + 20 };
  return { x: -20, y: Math.random() * WORLD.height };
}

export class WaveSpawner {
  constructor(options = {}) {
    this.waves = options.waves ?? WAVES_LEVEL_1;
    this.bossTypeId = options.bossTypeId ?? "tavern_guard_boss";
    this.enemyScale = options.enemyScale ?? 1;
    this.overridePool = options.overridePool ?? null;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.currentWaveId = "-";
  }

  configure(options) {
    this.waves = options.waves ?? this.waves;
    this.bossTypeId = options.bossTypeId ?? this.bossTypeId;
    this.enemyScale = options.enemyScale ?? this.enemyScale;
    this.overridePool = options.overridePool ?? this.overridePool;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.currentWaveId = "-";
  }

  update(deltaSeconds, elapsedSeconds, enemies) {
    const activeWave = this.waves.find((wave) => elapsedSeconds >= wave.start && elapsedSeconds < wave.end);
    this.currentWaveId = activeWave ? activeWave.id : "Boss";
    if (!activeWave) {
      return;
    }

    if (activeWave.pool.length === 0) {
      if (!this.bossSpawned) {
        const spawn = randomSpawnPoint();
        const boss = new Enemy(this.bossTypeId, spawn.x, spawn.y);
        boss.maxHp = Math.round(boss.maxHp * this.enemyScale);
        boss.hp = boss.maxHp;
        boss.damage = Math.round(boss.damage * (0.9 + this.enemyScale * 0.2));
        enemies.push(boss);
        this.bossSpawned = true;
      }
      return;
    }

    this.spawnTimer -= deltaSeconds;
    if (this.spawnTimer > 0) {
      return;
    }

    this.spawnTimer = activeWave.spawnEvery;
    const spawnCount = Math.max(1, Math.round((activeWave.spawnCount ?? 1) * Math.min(2.8, this.enemyScale)));
    const pool = this.overridePool?.length ? this.overridePool : activeWave.pool;
    for (let i = 0; i < spawnCount; i += 1) {
      const enemyType = pool[Math.floor(Math.random() * pool.length)];
      const spawn = randomSpawnPoint();
      const enemy = new Enemy(enemyType, spawn.x, spawn.y);
      enemy.maxHp = Math.round(enemy.maxHp * this.enemyScale);
      enemy.hp = enemy.maxHp;
      enemy.damage = Math.round(enemy.damage * (0.95 + this.enemyScale * 0.12));
      enemies.push(enemy);
    }
  }

  hasBossAlive(enemies) {
    return enemies.some((enemy) => enemy.typeId === this.bossTypeId);
  }

  isBossScheduled(elapsedSeconds) {
    return elapsedSeconds >= this.waves[this.waves.length - 1].start;
  }

  getBossMaxHp() {
    return ENEMY_TYPES[this.bossTypeId].maxHp;
  }
}

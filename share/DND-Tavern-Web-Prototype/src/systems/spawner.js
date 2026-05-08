import { ARENA, ENEMY_TYPES, WAVES_LEVEL_1 } from "../config.js";
import { Enemy } from "../entities/enemy.js";

function randomSpawnPoint() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * ARENA.width, y: -20 };
  if (side === 1) return { x: ARENA.width + 20, y: Math.random() * ARENA.height };
  if (side === 2) return { x: Math.random() * ARENA.width, y: ARENA.height + 20 };
  return { x: -20, y: Math.random() * ARENA.height };
}

export class WaveSpawner {
  constructor(options = {}) {
    this.waves = options.waves ?? WAVES_LEVEL_1;
    this.bossTypeId = options.bossTypeId ?? "tavern_guard_boss";
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.currentWaveId = "-";
  }

  configure(options) {
    this.waves = options.waves ?? this.waves;
    this.bossTypeId = options.bossTypeId ?? this.bossTypeId;
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
        enemies.push(new Enemy(this.bossTypeId, spawn.x, spawn.y));
        this.bossSpawned = true;
      }
      return;
    }

    this.spawnTimer -= deltaSeconds;
    if (this.spawnTimer > 0) {
      return;
    }

    this.spawnTimer = activeWave.spawnEvery;
    const spawnCount = activeWave.spawnCount ?? 1;
    for (let i = 0; i < spawnCount; i += 1) {
      const enemyType = activeWave.pool[Math.floor(Math.random() * activeWave.pool.length)];
      const spawn = randomSpawnPoint();
      enemies.push(new Enemy(enemyType, spawn.x, spawn.y));
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

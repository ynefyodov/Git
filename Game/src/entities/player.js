import { ARENA, ATTACK_CONFIG, PLAYER_CONFIG, WORLD } from "../config.js";

const MOVE_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "ц",
  "ф",
  "ы",
  "в",
  "arrowup",
  "arrowleft",
  "arrowdown",
  "arrowright",
  " ",
]);

export class Player {
  constructor(startX, startY, coopIndex = 0) {
    this.x = startX ?? ARENA.width / 2;
    this.y = startY ?? ARENA.height / 2;
    this.coopPlayerIndex = coopIndex;
    this.hp = PLAYER_CONFIG.maxHp;
    this.maxHp = PLAYER_CONFIG.maxHp;
    this.radius = PLAYER_CONFIG.radius;
    this.attackCooldownLeft = 0;
    this.facingX = 1;
    this.facingY = 0;
    this.jumpTimeLeft = 0;
    this.jumpCooldownLeft = 0;
    this.jumpDirectionX = 1;
    this.jumpDirectionY = 0;
    this.spaceWasDown = false;
    this.swingTimeLeft = 0;
    this.combatStyle = "melee";
  }

  static setupInput() {
    const input = new Set();
    const onDown = (event) => {
      const key = event.key.toLowerCase();
      if (MOVE_KEYS.has(key)) {
        input.add(key);
        event.preventDefault();
      }
    };
    const onUp = (event) => {
      const key = event.key.toLowerCase();
      if (MOVE_KEYS.has(key)) {
        input.delete(key);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return input;
  }

  update(deltaSeconds, input, bounds = WORLD) {
    let axisX = 0;
    let axisY = 0;

    if (input.has("w") || input.has("ц") || input.has("arrowup")) axisY -= 1;
    if (input.has("s") || input.has("ы") || input.has("arrowdown")) axisY += 1;
    if (input.has("a") || input.has("ф") || input.has("arrowleft")) axisX -= 1;
    if (input.has("d") || input.has("в") || input.has("arrowright")) axisX += 1;

    const spaceDown = input.has(" ");
    const hasMoveInput = axisX !== 0 || axisY !== 0;
    if (hasMoveInput) {
      const dirMagnitude = Math.hypot(axisX, axisY) || 1;
      this.jumpDirectionX = axisX / dirMagnitude;
      this.jumpDirectionY = axisY / dirMagnitude;
    }

    if (spaceDown && !this.spaceWasDown && this.jumpCooldownLeft <= 0) {
      this.jumpTimeLeft = 0.2;
      this.jumpCooldownLeft = 1.1;
      if (!hasMoveInput) {
        const facingMagnitude = Math.hypot(this.facingX, this.facingY) || 1;
        this.jumpDirectionX = this.facingX / facingMagnitude;
        this.jumpDirectionY = this.facingY / facingMagnitude;
      }
    }
    this.spaceWasDown = spaceDown;

    const magnitude = Math.hypot(axisX, axisY) || 1;
    const speedMul = this.speedMultiplier ?? 1;
    const baseSpeedX = (axisX / magnitude) * PLAYER_CONFIG.speed * speedMul;
    const baseSpeedY = (axisY / magnitude) * PLAYER_CONFIG.speed * speedMul;

    this.jumpTimeLeft = Math.max(0, this.jumpTimeLeft - deltaSeconds);
    this.jumpCooldownLeft = Math.max(0, this.jumpCooldownLeft - deltaSeconds);

    const jumpActive = this.jumpTimeLeft > 0;
    const jumpBoost = jumpActive ? 320 : 0;
    this.x += (baseSpeedX + this.jumpDirectionX * jumpBoost) * deltaSeconds;
    this.y += (baseSpeedY + this.jumpDirectionY * jumpBoost) * deltaSeconds;

    const margin = bounds?.margin ?? ARENA.margin;
    this.x = Math.max(margin, Math.min((bounds?.width ?? ARENA.width) - margin, this.x));
    this.y = Math.max(margin, Math.min((bounds?.height ?? ARENA.height) - margin, this.y));

    this.attackCooldownLeft = Math.max(0, this.attackCooldownLeft - deltaSeconds);
    this.swingTimeLeft = Math.max(0, this.swingTimeLeft - deltaSeconds);
  }

  tryMeleeAttack(enemies, attackStats = {}) {
    if (this.attackCooldownLeft > 0 || enemies.length === 0) {
      return [];
    }

    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const enemy of enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }
    }

    if (!nearest) {
      return [];
    }

    const dx = nearest.x - this.x;
    const dy = nearest.y - this.y;
    const norm = Math.hypot(dx, dy) || 1;
    const range = attackStats.range ?? ATTACK_CONFIG.meleeRange;
    if (Math.hypot(dx, dy) > range + nearest.radius) {
      return [];
    }
    this.facingX = dx / norm;
    this.facingY = dy / norm;

    const cooldown = attackStats.cooldown ?? ATTACK_CONFIG.cooldown;
    const damage = attackStats.damage ?? ATTACK_CONFIG.meleeDamage;
    this.attackCooldownLeft = cooldown;
    this.swingTimeLeft = ATTACK_CONFIG.swingDuration;

    return [{
      enemy: nearest,
      damage,
      owner: this,
    }];
  }

  tryRangedAttack(enemies, attackStats = {}) {
    if (this.attackCooldownLeft > 0 || enemies.length === 0) {
      return null;
    }

    const range = attackStats.range ?? ATTACK_CONFIG.rangedRange;
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const enemy of enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.hypot(dx, dy);
      if (distance > range + enemy.radius) continue;
      const distanceSq = distance * distance;
      if (distanceSq < nearestDistance) {
        nearestDistance = distanceSq;
        nearest = enemy;
      }
    }

    if (!nearest) {
      return null;
    }

    const dx = nearest.x - this.x;
    const dy = nearest.y - this.y;
    const norm = Math.hypot(dx, dy) || 1;
    this.facingX = dx / norm;
    this.facingY = dy / norm;

    const cooldown = attackStats.cooldown ?? ATTACK_CONFIG.cooldown;
    const damage = attackStats.damage ?? ATTACK_CONFIG.rangedProjectileDamage;
    this.attackCooldownLeft = cooldown;

    return {
      x: this.x,
      y: this.y,
      vx: (dx / norm) * ATTACK_CONFIG.rangedProjectileSpeed,
      vy: (dy / norm) * ATTACK_CONFIG.rangedProjectileSpeed,
      radius: ATTACK_CONFIG.rangedProjectileRadius,
      ttl: ATTACK_CONFIG.rangedProjectileLifetime,
      damage,
      owner: this,
    };
  }

  draw(ctx, renderAssets = null) {
    const heroSprite =
      this.combatStyle === "ranged"
        ? (renderAssets?.hero_ranged ?? renderAssets?.hero_melee)
        : (renderAssets?.hero_melee ?? renderAssets?.hero_ranged);
    if (heroSprite) {
      const jumpActive = this.jumpTimeLeft > 0;
      const drawRadius = this.radius * 2.15;
      ctx.save();
      if (jumpActive) {
        ctx.strokeStyle = "rgba(182, 224, 255, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.25, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.drawImage(
        heroSprite,
        this.x - drawRadius,
        this.y - drawRadius,
        drawRadius * 2,
        drawRadius * 2
      );
      if (this.swingTimeLeft > 0 && this.combatStyle === "melee") {
        this.drawSwing(ctx, this.radius * 1.9);
      }
      ctx.restore();
      return;
    }

    const dirX = this.facingX || 1;
    const dirY = this.facingY || 0;
    const rightX = -dirY;
    const rightY = dirX;
    const scale = this.radius;
    const jumpActive = this.jumpTimeLeft > 0;

    if (jumpActive) {
      ctx.strokeStyle = "rgba(182, 224, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, scale * 1.25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cloak silhouette (второй игрок — другой оттенок)
    ctx.fillStyle = this.coopPlayerIndex === 1 ? "#4a2562" : "#1f3654";
    ctx.beginPath();
    ctx.moveTo(this.x - rightX * scale * 0.95, this.y - rightY * scale * 0.95);
    ctx.lineTo(this.x + rightX * scale * 0.95, this.y + rightY * scale * 0.95);
    ctx.lineTo(this.x - dirX * scale * 1.5, this.y - dirY * scale * 1.5);
    ctx.closePath();
    ctx.fill();

    // Torso armor
    ctx.beginPath();
    ctx.fillStyle = this.coopPlayerIndex === 1 ? "#c98ae0" : PLAYER_CONFIG.color;
    ctx.arc(this.x, this.y, scale * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.fillStyle = "#d5b08a";
    ctx.arc(this.x + dirX * scale * 0.45, this.y + dirY * scale * 0.45, scale * 0.33, 0, Math.PI * 2);
    ctx.fill();

    // Shield
    ctx.fillStyle = "#5d6d7e";
    ctx.beginPath();
    ctx.arc(this.x - rightX * scale * 0.8, this.y - rightY * scale * 0.8, scale * 0.36, 0, Math.PI * 2);
    ctx.fill();

    // Sword
    const swordBaseX = this.x + rightX * scale * 0.45;
    const swordBaseY = this.y + rightY * scale * 0.45;
    const swordTipX = swordBaseX + dirX * scale * 1.4;
    const swordTipY = swordBaseY + dirY * scale * 1.4;
    ctx.strokeStyle = "#d8dee7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(swordBaseX, swordBaseY);
    ctx.lineTo(swordTipX, swordTipY);
    ctx.stroke();
    ctx.strokeStyle = "#6b4b2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(swordBaseX - rightX * scale * 0.14, swordBaseY - rightY * scale * 0.14);
    ctx.lineTo(swordBaseX + rightX * scale * 0.14, swordBaseY + rightY * scale * 0.14);
    ctx.stroke();
    if (this.swingTimeLeft > 0 && this.combatStyle === "melee") {
      this.drawSwing(ctx, scale * 1.8);
    }
  }

  drawSwing(ctx, radius) {
    const dirAngle = Math.atan2(this.facingY || 0, this.facingX || 1);
    ctx.strokeStyle = "rgba(238, 246, 255, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, dirAngle - 0.52, dirAngle + 0.52);
    ctx.stroke();
  }

  isInvulnerable() {
    return this.jumpTimeLeft > 0;
  }
}

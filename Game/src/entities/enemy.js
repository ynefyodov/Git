import { ENEMY_TYPES } from "../config.js";

export class Enemy {
  static nextNetId = 1;

  constructor(typeId, x, y) {
    const type = ENEMY_TYPES[typeId];
    this.netId = Enemy.nextNetId++;
    this.typeId = typeId;
    this.type = type;
    this.x = x;
    this.y = y;
    this.hp = type.maxHp;
    this.maxHp = type.maxHp;
    this.radius = type.radius;
    this.damage = type.damage;
    this.speed = type.speed;
    this.isBoss = typeId.endsWith("_boss");
    this.dead = false;
    /** Кулдаун контакта отдельно на каждого игрока (кооп). */
    this._contactCd = [0, 0];
    this.chargeCooldownLeft = type.chargeCooldown ?? 0;
    this.chargeLeft = 0;
  }

  static pickNearestPlayer(players, x, y) {
    let best = null;
    let bestD = Number.POSITIVE_INFINITY;
    for (const p of players) {
      if (!p) continue;
      const dx = p.x - x;
      const dy = p.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  update(deltaSeconds, playerOrPlayers) {
    const player = Array.isArray(playerOrPlayers)
      ? Enemy.pickNearestPlayer(playerOrPlayers, this.x, this.y)
      : playerOrPlayers;
    if (!player) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.hypot(dx, dy) || 1;

    let speed = this.speed;
    if (this.isBoss) {
      this.chargeCooldownLeft -= deltaSeconds;
      if (this.chargeCooldownLeft <= 0 && this.chargeLeft <= 0) {
        this.chargeLeft = this.type.chargeDuration;
        this.chargeCooldownLeft = this.type.chargeCooldown;
      }

      if (this.chargeLeft > 0) {
        this.chargeLeft -= deltaSeconds;
        speed *= this.type.chargeSpeedMultiplier;
      }
    }

    this.x += (dx / distance) * speed * deltaSeconds;
    this.y += (dy / distance) * speed * deltaSeconds;
    for (let i = 0; i < this._contactCd.length; i += 1) {
      this._contactCd[i] = Math.max(0, this._contactCd[i] - deltaSeconds);
    }
  }

  applyDamage(value) {
    this.hp -= value;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  draw(ctx, renderAssets = null) {
    const sprite = renderAssets?.[this.typeId];
    if (sprite) {
      if (this.isBoss && this.chargeLeft > 0) {
        ctx.fillStyle = "rgba(240, 200, 90, 0.3)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.55, 0, Math.PI * 2);
        ctx.fill();
      }
      const drawRadius = this.radius * (this.isBoss ? 2.1 : 1.9);
      ctx.drawImage(
        sprite,
        this.x - drawRadius,
        this.y - drawRadius,
        drawRadius * 2,
        drawRadius * 2
      );
    } else if (this.typeId === "rat") {
      this.drawRat(ctx);
    } else if (this.typeId === "thug") {
      this.drawThug(ctx);
    } else if (this.typeId === "cultist") {
      this.drawCultist(ctx);
    } else if (this.isBoss) {
      this.drawBossGuard(ctx);
    } else {
      ctx.beginPath();
      ctx.fillStyle = this.type.color;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    const width = this.radius * 2;
    const barX = this.x - this.radius;
    const barY = this.y - this.radius - 8;
    ctx.fillStyle = "#2d1c1c";
    ctx.fillRect(barX, barY, width, 4);
    ctx.fillStyle = this.isBoss ? "#f0dc75" : "#9be16d";
    ctx.fillRect(barX, barY, width * hpRatio, 4);
  }

  drawRat(ctx) {
    const r = this.radius;
    ctx.fillStyle = "#6a584b";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, r * 1.05, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#c7a47c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - r * 1.1, this.y);
    ctx.quadraticCurveTo(this.x - r * 1.8, this.y + r * 0.6, this.x - r * 2, this.y - r * 0.2);
    ctx.stroke();

    ctx.fillStyle = "#cfb18f";
    ctx.beginPath();
    ctx.arc(this.x + r * 0.8, this.y - r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.arc(this.x + r * 0.8, this.y + r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  drawThug(ctx) {
    const r = this.radius;
    ctx.fillStyle = "#5a342a";
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8f3f2f";
    ctx.fillRect(this.x - r * 0.75, this.y - r * 0.2, r * 1.5, r * 0.9);

    ctx.fillStyle = "#d2b08e";
    ctx.beginPath();
    ctx.arc(this.x, this.y - r * 0.6, r * 0.34, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#423229";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + r * 0.5, this.y + r * 0.1);
    ctx.lineTo(this.x + r * 1.1, this.y + r * 0.8);
    ctx.stroke();
  }

  drawCultist(ctx) {
    const r = this.radius;
    ctx.fillStyle = "#3b2454";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - r * 1.1);
    ctx.lineTo(this.x + r * 0.9, this.y + r * 0.95);
    ctx.lineTo(this.x - r * 0.9, this.y + r * 0.95);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ece3d3";
    ctx.beginPath();
    ctx.arc(this.x, this.y - r * 0.18, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#b29ddb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + r * 0.45, this.y);
    ctx.lineTo(this.x + r * 1.05, this.y - r * 0.8);
    ctx.stroke();
  }

  drawBossGuard(ctx) {
    const r = this.radius;
    const chargeGlow = this.chargeLeft > 0 ? 1 : 0;

    if (chargeGlow) {
      ctx.fillStyle = "rgba(240, 200, 90, 0.3)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#7f6c38";
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d8c27a";
    ctx.fillRect(this.x - r * 0.7, this.y - r * 0.7, r * 1.4, r * 1.2);

    ctx.fillStyle = "#f2dcc0";
    ctx.beginPath();
    ctx.arc(this.x, this.y - r * 0.55, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#4d3e1d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x + r * 0.7, this.y - r * 0.2);
    ctx.lineTo(this.x + r * 1.35, this.y + r * 0.75);
    ctx.stroke();
  }
}

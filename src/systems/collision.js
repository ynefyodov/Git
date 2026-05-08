export function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = bx - ax;
  const dy = by - ay;
  const radius = ar + br;
  return dx * dx + dy * dy <= radius * radius;
}

export function circlesWithinRadius(ax, ay, bx, by, radius) {
  const dx = bx - ax;
  const dy = by - ay;
  return dx * dx + dy * dy <= radius * radius;
}

export function applyProjectileHits(projectiles, enemies) {
  let kills = 0;
  const hitEvents = [];
  for (const projectile of projectiles) {
    if (projectile.dead) continue;
    const maxHits = Math.max(1, 1 + (projectile.pierceCount ?? 0));
    const already = new Set();
    let hits = 0;
    for (const enemy of enemies) {
      if (enemy.dead || already.has(enemy)) continue;
      if (!circlesOverlap(projectile.x, projectile.y, projectile.radius, enemy.x, enemy.y, enemy.radius)) {
        continue;
      }
      const damage = projectile.damage;
      enemy.applyDamage(damage);
      already.add(enemy);
      hits += 1;
      hitEvents.push({
        projectile,
        enemy,
        damage,
        owner: projectile.owner ?? null,
      });
      if (enemy.dead) {
        kills += 1;
      }
      if (hits >= maxHits) {
        projectile.dead = true;
        break;
      }
    }
  }
  return { kills, hitEvents };
}

export function applyEnemyContactDamage(players, enemies, damageTickSeconds) {
  const list = Array.isArray(players) ? players : [players];
  for (let pi = 0; pi < list.length; pi += 1) {
    const player = list[pi];
    if (!player) continue;
    if (typeof player.isInvulnerable === "function" && player.isInvulnerable()) {
      continue;
    }
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      if (!enemy._contactCd) enemy._contactCd = [0, 0];
      while (enemy._contactCd.length <= pi) enemy._contactCd.push(0);
      if (enemy._contactCd[pi] > 0) continue;
      if (!circlesOverlap(player.x, player.y, player.radius, enemy.x, enemy.y, enemy.radius)) continue;
      player.hp -= enemy.damage;
      enemy._contactCd[pi] = damageTickSeconds;
    }
  }
}

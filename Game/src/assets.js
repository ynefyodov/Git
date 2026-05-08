const ASSET_PATHS = {
  hero_melee: "./assets/characters/hero-melee.png",
  hero_ranged: "./assets/characters/hero-ranged.png",
  rat: "./assets/enemies/rat.png",
  thug: "./assets/enemies/thug.png",
  cultist: "./assets/enemies/cultist.png",
  tavern_guard_boss: "./assets/enemies/tavern-guard-boss.png",
  dock_warden_boss: "./assets/enemies/dock-warden-boss.png",
  projectile: "./assets/fx/projectile-arrow.png",
  tavern_bg: "./assets/backgrounds/tavern-topdown.svg",
  docks_bg: "./assets/backgrounds/docks-night.svg",
};

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load asset: ${path}`));
    image.src = path;
  });
}

export async function loadAssets() {
  const entries = Object.entries(ASSET_PATHS);
  const loaded = {};
  await Promise.all(entries.map(async ([key, path]) => {
    try {
      loaded[key] = await loadImage(path);
    } catch (_error) {
      loaded[key] = null;
    }
  }));
  return loaded;
}

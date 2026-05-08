const GENERATED_SHEET_CANDIDATES = [
  "../assets/c__Users_________________AppData_Roaming_Cursor_User_workspaceStorage_47a63d484e5982453a13fedcec7bdf1f_images_kY7ddCaCRINrWLUM7p7bwXueWmv0HYkTy-vQh7koEj6zMXzK_Q0oXE5jNqkp0Dxo2ZCNsIC2mLnLgaX3xcOoF6q_-d9c1b143-fc13-41a9-8acc-f38674cac898.png",
  "../assets/c__Users_________________AppData_Roaming_Cursor_User_workspaceStorage_47a63d484e5982453a13fedcec7bdf1f_images_zRiQB8ZxKMmzUdNATffyqWJ8YoJWY8BSxQL3axPp1eENps0D6I3QpdnXNjiNvKRxPqbEdcnDI9oWKHnPIw9NFTyF-df55512d-34df-4c89-b139-131e0f4ce7c6.png",
];

const LOCATION_MOODBOARD_CANDIDATES = [
  "../assets/c__Users_________________AppData_Roaming_Cursor_User_workspaceStorage_47a63d484e5982453a13fedcec7bdf1f_images_FlMnDsn-rfosV79ATgsU_XE6HtWIWVKvGpSa0lRBEv2ri6-fRbH4_eU9R8fnAFIj3xqDedvS1e6omU3-AK-CBPqS-dcbba9c2-8010-4832-b1cd-48b1338a1992.png",
];

const STATIC_ASSET_PATHS = {
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

async function loadFirstAvailableImage(paths) {
  for (const path of paths) {
    try {
      return await loadImage(path);
    } catch (_err) {
      // Try next candidate.
    }
  }
  return null;
}

function spriteFromGrid(image, col, row, cols = 32, rows = 10) {
  if (!image) return null;
  const cellW = image.width / cols;
  const cellH = image.height / rows;
  const sx = Math.floor(col * cellW + 1);
  const sy = Math.floor(row * cellH + 1);
  const sw = Math.max(1, Math.floor(cellW - 2));
  const sh = Math.max(1, Math.floor(cellH - 2));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const c = canvas.getContext("2d");
  c.imageSmoothingEnabled = false;
  c.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
}

function makeProjectileSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 20;
  canvas.height = 20;
  const c = canvas.getContext("2d");
  c.imageSmoothingEnabled = false;
  c.translate(10, 10);
  c.rotate(-Math.PI / 6);
  c.fillStyle = "#f2f5ff";
  c.fillRect(-1, -7, 2, 11);
  c.fillStyle = "#9aa6be";
  c.fillRect(-3, 4, 6, 2);
  c.fillStyle = "#704a30";
  c.fillRect(-1, 5, 2, 4);
  return canvas;
}

export async function loadAssets() {
  const loaded = {};
  const generatedSheet = await loadFirstAvailableImage(GENERATED_SHEET_CANDIDATES);
  loaded.location_moodboard = await loadFirstAvailableImage(LOCATION_MOODBOARD_CANDIDATES);

  loaded.hero_melee = spriteFromGrid(generatedSheet, 0, 0);
  loaded.hero_ranged = spriteFromGrid(generatedSheet, 12, 0);
  loaded.rat = spriteFromGrid(generatedSheet, 16, 7);
  loaded.thug = spriteFromGrid(generatedSheet, 20, 7);
  loaded.cultist = spriteFromGrid(generatedSheet, 25, 8);
  loaded.murloc = spriteFromGrid(generatedSheet, 28, 8);
  loaded.tavern_guard_boss = spriteFromGrid(generatedSheet, 31, 7);
  loaded.dock_warden_boss = spriteFromGrid(generatedSheet, 31, 8);
  loaded.projectile = makeProjectileSprite();

  const staticEntries = Object.entries(STATIC_ASSET_PATHS);
  await Promise.all(staticEntries.map(async ([key, path]) => {
    try {
      loaded[key] = await loadImage(path);
    } catch (_error) {
      loaded[key] = null;
    }
  }));

  return loaded;
}

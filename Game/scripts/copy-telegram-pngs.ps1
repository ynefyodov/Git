# Copy hand-picked PNGs from Telegram Desktop pack (folder that contains archer/, vragi/, etc.)
$ErrorActionPreference = "Stop"
$telegramDesktop = Join-Path $env:USERPROFILE "Downloads\Telegram Desktop"
$pngRoot = Get-ChildItem -LiteralPath $telegramDesktop -Directory -ErrorAction Stop |
  Where-Object { (Test-Path (Join-Path $_.FullName "archer")) -and (Test-Path (Join-Path $_.FullName "vragi")) } |
  Select-Object -First 1 -ExpandProperty FullName
if (-not $pngRoot) { throw "Could not find Telegram PNG pack under $telegramDesktop" }

$gameRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path -LiteralPath (Join-Path $gameRoot "package.json"))) {
  throw "Run from Game repo (package.json not found in $gameRoot)"
}

$dest = @{
  "characters" = Join-Path $gameRoot "assets\characters"
  "enemies"    = Join-Path $gameRoot "assets\enemies"
  "fx"         = Join-Path $gameRoot "assets\fx"
}
foreach ($k in $dest.Keys) { New-Item -ItemType Directory -Force -Path $dest[$k] | Out-Null }

$map = @(
  @{ Src = "voin\pngtree-viking-warrior-with-axe-standing-strong-and-ready-for-battle-png-image_18756845.png"; Dst = Join-Path $dest["characters"] "hero-melee.png" }
  @{ Src = "archer\pngtree-archer-shooting-arrow-png-image_14679137.png"; Dst = Join-Path $dest["characters"] "hero-ranged.png" }
  @{ Src = "vragi\retro-cartoon-creepy-tarantula-free-png.png"; Dst = Join-Path $dest["enemies"] "rat.png" }
  @{ Src = "vragi\470-4704432_orc-png-image-heroes-of-might-and-magic-removebg-preview.png"; Dst = Join-Path $dest["enemies"] "thug.png" }
  @{ Src = "vragi\pngtree-modern-mascot-evil-chupacabra-monster-png-image_12544854.png"; Dst = Join-Path $dest["enemies"] "cultist.png" }
  @{ Src = "vragi\pngtree-powerful-orc-warrior-with-skull-armor-and-axe-png-image_21107757-removebg-preview.png"; Dst = Join-Path $dest["enemies"] "tavern-guard-boss.png" }
  @{ Src = "vragi\pngtree-alien-sea-creature-png-image_19912773.png"; Dst = Join-Path $dest["enemies"] "dock-warden-boss.png" }
  @{ Src = "archer\pngtree-sharp-black-and-silver-arrow-with-metallic-tip-png-image_15804960-removebg-preview.png"; Dst = Join-Path $dest["fx"] "projectile-arrow.png" }
)

foreach ($row in $map) {
  $from = Join-Path $pngRoot $row.Src
  if (-not (Test-Path -LiteralPath $from)) { throw "Missing source: $from" }
  Copy-Item -LiteralPath $from -Destination $row.Dst -Force
  Write-Host "OK -> $($row.Dst)"
}
Write-Host "Done. Source root: $pngRoot"

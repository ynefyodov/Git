@echo off
REM Запуск relay коопа без npm (нужен один раз install-deps.cmd или npm.cmd install).
cd /d "%~dp0"
if not exist "node_modules\ws\package.json" (
  echo Сначала установи зависимости: запусти install-deps.cmd из этой папки.
  pause
  exit /b 1
)
node server\coop-server.mjs
if errorlevel 1 pause
exit /b %errorlevel%

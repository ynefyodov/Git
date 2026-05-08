@echo off
REM Обходит блокировку npm.ps1 в PowerShell (ExecutionPolicy).
cd /d "%~dp0"
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден в PATH. Установи Node с https://nodejs.org/
  pause
  exit /b 1
)
call npm.cmd install
if errorlevel 1 pause
exit /b %errorlevel%

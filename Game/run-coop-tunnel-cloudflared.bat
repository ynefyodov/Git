@echo off
chcp 65001 >nul
cd /d "%~dp0"
where cloudflared >nul 2>&1
if errorlevel 1 (
  echo [Ошибка] cloudflared не найден в PATH.
  echo Установи: winget install Cloudflare.cloudflared
  echo Или скачай exe: https://github.com/cloudflare/cloudflared/releases
  pause
  exit /b 1
)
echo.
echo === Шаг 1 === В ДРУГОМ окне должен работать run-coop-server.bat (порт 8765).
echo === Шаг 2 === Ниже появится URL. В игре у хоста и гостя введи его как wss://.... (https замени на wss, без порта).
echo === Протокол edge: http2 (TCP) — стабильнее, если в логах были QUIC timeout / "no recent network activity".
echo === Опционально: положи в эту папку файл cacert.pem с https://curl.se/ca/cacert.pem — тогда cloudflared подхватит --origin-ca-pool (меньше предупреждений TLS на Windows).
echo.
if exist "%~dp0cacert.pem" (
  echo [Инфо] Используется "%~dp0cacert.pem" для проверки сертификатов.
  cloudflared tunnel --url http://127.0.0.1:8765 --protocol http2 --origin-ca-pool "%~dp0cacert.pem"
) else (
  cloudflared tunnel --url http://127.0.0.1:8765 --protocol http2
)
pause

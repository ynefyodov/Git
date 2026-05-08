# Туннель для коопа через интернет (не только LAN)

Я не могу открыть туннель за тебя — это делается **на твоём ПК** двумя окнами терминала (или двумя `.bat`).

## Вариант A: Cloudflare Quick Tunnel (без аккаунта Cloudflare)

1. Установи **`cloudflared`** (один раз):
   - **winget:** `winget install Cloudflare.cloudflared`
   - или скачай `cloudflared-windows-amd64.exe` с [релизов cloudflared](https://github.com/cloudflare/cloudflared/releases), переименуй в `cloudflared.exe` и положи в PATH или в папку с игрой.

2. **Окно 1** — relay игры (как обычно):
   - `run-coop-server.bat`  
   - или `node server/coop-server.mjs`  
   Должна появиться строка про порт **8765**.

3. **Окно 2** — туннель:
   - Запусти **`run-coop-tunnel-cloudflared.bat`** (внутри уже стоит **`--protocol http2`** — идёт по TCP, а не QUIC; так реже ловят `timeout: no recent network activity` к `198.41.x.x`).
   - или вручную:  
     `cloudflared tunnel --url http://127.0.0.1:8765 --protocol http2`

4. В логе cloudflared появится ссылка вида **`https://…..trycloudflare.com`**.

5. **В игре у хоста и у гостя** в поле WebSocket укажи тот же хост, но с **`wss://`** (не `https`):
   - было: `https://random-words.trycloudflare.com`  
   - нужно: **`wss://random-words.trycloudflare.com`**  
   (порт не пиши — 443 по умолчанию.)

6. Сначала нажми **«Я хост»** на твоём ПК, потом **«Я гость»** у друга с тем же URL.

Ограничения: URL при каждом запуске туннеля **новый**; бесплатный trycloudflare иногда медленный; не для продакшена.

---

## Вариант B: ngrok

1. Зарегистрируйся на [ngrok](https://ngrok.com/), получи authtoken, выполни:  
   `ngrok config add-authtoken <токен>`

2. Окно 1: `run-coop-server.bat`  
3. Окно 2: `ngrok http 8765`  
4. В интерфейсе ngrok возьми HTTPS-домен и подставь в игру как **`wss://твой-поддомен.ngrok-free.dev`** (схема `wss`, без `:443`).

---

## Если не коннектится

- Туннель и **coop-server** должны идти **одновременно**.
- Для URL из туннеля почти всегда нужен **`wss://`**, не `ws://`.
- Брандмауэр Windows обычно не мешает **исходящему** cloudflared; входящий порт 8765 с интернета для туннеля **не обязателен** (весь вход идёт через cloudflared).

### Ошибки QUIC / `no recent network activity` / `198.41.x.x`

Это обрыв **UDP (QUIC)** до edge Cloudflare: провайдер, Wi‑Fi, VPN, корпоративный фаервол.

1. Уже учтено в `run-coop-tunnel-cloudflared.bat`: **`--protocol http2`** (трафик к Cloudflare по TCP).
2. Если всё равно плохо: отключи VPN, попробуй другую сеть или кабель вместо Wi‑Fi.
3. Опционально только IPv4:  
   `cloudflared tunnel --url http://127.0.0.1:8765 --protocol http2 --edge-ip-version 4`
4. Запасной путь — **ngrok** (см. вариант B выше).

---

## Разбор типичных строк в логе (как у тебя)

- **`Settings: map[... protocol:http2 ...]`** + **`Registered tunnel connection ... protocol=http2`** — туннель **живой**, к edge Cloudflare вышли по TCP/http2. Это главный признак успеха.
- **`Cannot determine default origin certificate path` / `cert.pem`** — для **quick tunnel** (`--url`) чаще всего **не блокирует** работу: это про «именованные» туннели с собственным сертификатом origin. Если trycloudflare-URL открывается и кооп идёт — можно не трогать.
- **`does not support loading the system root certificate pool on Windows`** — ограничение cloudflared на Windows. Можно положить в папку с игрой **`cacert.pem`** (скачать [cacert.pem с curl.se](https://curl.se/ca/cacert.pem)) — тогда **`run-coop-tunnel-cloudflared.bat`** сам добавит **`--origin-ca-pool`** к команде.
- **`Error shutting down control stream: client disconnected`** — кто-то с **другой стороны** закрыл соединение (браузер, гость вышел, проверка здоровья, простой). Часто следом идёт **`Retrying` / снова `Registered`** — это **нормальное переподключение**, не обязательно поломка игры.
- **`context canceled`** на control stream — чаще всего **закрыли туннель** (Ctrl+C, закрыто окно), **таймаут/простой** trycloudflare или обрыв до edge. Запусти cloudflared снова, возьми **новый** URL и переподключи хоста и гостя в игре.

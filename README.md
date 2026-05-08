# DND Tavern Prototype

Прототип игры в стиле "таверна + выживание" на базе Electron + Web.

## Структура

- `Game/` — исходный код проекта
- `Game/server/` — lobby relay (WebSocket) для мультиплеера
- `Game/assets/` — игровые ресурсы

## Играть в браузере

- Публичная web-версия (GitHub Pages): `https://ynefyodov.github.io/Git/`
- Деплой идёт автоматически через workflow `/.github/workflows/deploy-pages.yml` после push в `main`.

## Быстрый старт

1. Перейдите в папку проекта:

```bash
cd Game
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите приложение:

```bash
npm start
```

## Дополнительно

- Запуск lobby relay (для мультиплеера):

```bash
npm run coop-server
```

- В браузере укажи URL relay в поле `WebSocket URL` (например `ws://127.0.0.1:8765`), затем:
  - первый вошедший в комнату становится host;
  - остальные входят в ту же комнату, нажимают `Готов`;
  - host нажимает `Старт`.

- Сборка portable-версии:

```bash
npm run dist
```

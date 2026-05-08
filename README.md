# DND Tavern Prototype

Прототип игры в стиле "таверна + выживание" на базе Electron + Web.

## Структура

- `Game/` — исходный код проекта
- `Game/server/` — lobby relay (WebSocket) для мультиплеера
- `Game/assets/` — игровые ресурсы

## Играть в браузере

- Публичная web-версия (GitHub Pages): `https://ynefyodov.github.io/Git/`
- Деплой идёт автоматически через workflow `/.github/workflows/deploy-pages.yml` после push в `main`.
- Текущая Pages-версия — single-player прототип (без кооператива).

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

- Запуск локального relay (опционально, если вернём кооп позже):

```bash
npm run coop-server
```

## GitHub "агенты" (Actions automation)

- `/.github/workflows/agent-ci-failure-issue.yml`
  - условие: падает деплойный workflow;
  - действие: создаёт/обновляет issue с метками `agent:todo` и `ci-failure`.
- `/.github/workflows/agent-issue-autopick.yml`
  - условие: issue имеет метку `agent:todo`;
  - действие: переводит в `agent:in-progress` и оставляет служебный комментарий.

- Сборка portable-версии:

```bash
npm run dist
```

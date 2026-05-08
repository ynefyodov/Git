/**
 * Lobby relay:
 * - игроки входят в комнату roomId;
 * - первый участник комнаты становится хостом;
 * - не-хосты ставят ready, хост запускает матч;
 * - во время матча state шлётся от хоста всем гостям,
 *   input принимается только от active guest (первый не-хост при старте).
 */
import { WebSocketServer } from "ws";

const PORT = Number(process.env.COOP_PORT) || 8765;
const rooms = new Map();
let nextClientId = 1;

function safeSend(ws, obj) {
  if (ws?.readyState !== 1) return;
  ws.send(JSON.stringify(obj));
}

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      hostId: null,
      started: false,
      activeGuestId: null,
      clients: new Map(),
    });
  }
  return rooms.get(roomId);
}

function serializeRoom(room) {
  const players = [...room.clients.values()].map((c) => ({
    id: c.id,
    name: c.name,
    ready: Boolean(c.ready),
    role: c.id === room.hostId ? "host" : "guest",
  }));
  const guestPlayers = players.filter((p) => p.role === "guest");
  const canStart = guestPlayers.length > 0 && guestPlayers.every((p) => p.ready);
  return {
    type: "roomState",
    roomId: room.id,
    started: room.started,
    activeGuestId: room.activeGuestId,
    canStart,
    players,
  };
}

function broadcastRoomState(room) {
  const packet = serializeRoom(room);
  for (const client of room.clients.values()) {
    safeSend(client.ws, packet);
  }
}

function leaveRoom(ws) {
  const room = ws._room;
  const client = ws._client;
  if (!room || !client) return;

  room.clients.delete(client.id);
  ws._room = null;
  ws._client = null;

  if (room.clients.size === 0) {
    rooms.delete(room.id);
    return;
  }

  if (room.hostId === client.id) {
    const [nextHost] = room.clients.values();
    room.hostId = nextHost.id;
    room.started = false;
    room.activeGuestId = null;
    for (const c of room.clients.values()) c.ready = false;
  } else if (room.activeGuestId === client.id) {
    room.activeGuestId = [...room.clients.values()]
      .find((c) => c.id !== room.hostId)?.id ?? null;
  }

  broadcastRoomState(room);
}

function joinRoom(ws, roomIdRaw, nameRaw) {
  const roomId = String(roomIdRaw || "public").trim().slice(0, 32) || "public";
  const name = String(nameRaw || "Player").trim().slice(0, 32) || "Player";
  leaveRoom(ws);

  const room = getOrCreateRoom(roomId);
  const client = {
    id: ws._clientId,
    ws,
    name,
    ready: false,
  };

  room.clients.set(client.id, client);
  if (!room.hostId) room.hostId = client.id;
  ws._room = room;
  ws._client = client;

  safeSend(ws, {
    type: "joined",
    selfId: client.id,
    roomId: room.id,
    role: client.id === room.hostId ? "host" : "guest",
  });
  broadcastRoomState(room);
}

function onStartMatch(ws) {
  const room = ws._room;
  const client = ws._client;
  if (!room || !client || room.hostId !== client.id) return;

  const players = [...room.clients.values()];
  const guests = players.filter((p) => p.id !== room.hostId);
  if (guests.length === 0) return;
  if (!guests.every((p) => p.ready)) return;

  room.started = true;
  room.activeGuestId = guests[0].id;
  broadcastRoomState(room);
  for (const c of room.clients.values()) {
    safeSend(c.ws, {
      type: "matchStarted",
      roomId: room.id,
      activeGuestId: room.activeGuestId,
    });
  }
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[coop] Lobby relay on ws://0.0.0.0:${PORT} (LAN: ws://<этот-ПК>:${PORT})`);

wss.on("connection", (ws) => {
  ws._clientId = `p${nextClientId++}`;
  ws._room = null;
  ws._client = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (!msg || typeof msg.type !== "string") return;

    if (msg.type === "hello") {
      joinRoom(ws, msg.roomId, msg.name);
      return;
    }

    const room = ws._room;
    const client = ws._client;
    if (!room || !client) return;

    if (msg.type === "setReady") {
      if (client.id !== room.hostId && !room.started) {
        client.ready = Boolean(msg.ready);
        broadcastRoomState(room);
      }
      return;
    }

    if (msg.type === "startMatch") {
      onStartMatch(ws);
      return;
    }

    if (msg.type === "state") {
      if (client.id === room.hostId && room.started) {
        for (const c of room.clients.values()) {
          if (c.id !== room.hostId) {
            safeSend(c.ws, { type: "state", payload: msg.payload ?? null });
          }
        }
      }
      return;
    }

    if (msg.type === "input") {
      if (room.started && room.activeGuestId === client.id) {
        const host = room.clients.get(room.hostId);
        safeSend(host?.ws, { type: "input", keys: Array.isArray(msg.keys) ? msg.keys : [] });
      }
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
  });
});

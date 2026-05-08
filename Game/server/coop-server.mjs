/**
 * Relay-сервер для коопа: первый клиент с role=host — хост, второй с role=guest — гость.
 * Запуск: npm run coop-server (порт COOP_PORT или 8765). Открой порт в файрволе для LAN.
 */
import { WebSocketServer } from "ws";

const PORT = Number(process.env.COOP_PORT) || 8765;

let hostWs = null;
let guestWs = null;

function sendPeerStatus() {
  const msg = JSON.stringify({
    type: "peer",
    host: Boolean(hostWs && hostWs.readyState === 1),
    guest: Boolean(guestWs && guestWs.readyState === 1),
  });
  if (hostWs?.readyState === 1) hostWs.send(msg);
  if (guestWs?.readyState === 1) guestWs.send(msg);
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[coop] WebSocket relay on ws://0.0.0.0:${PORT} (LAN: ws://<этот-ПК>:${PORT})`);

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg.type === "iam") {
      if (msg.role === "host") {
        if (hostWs && hostWs !== ws) {
          try { hostWs.close(); } catch (_) { /* ignore */ }
        }
        hostWs = ws;
        ws._coopRole = "host";
      } else if (msg.role === "guest") {
        if (guestWs && guestWs !== ws) {
          try { guestWs.close(); } catch (_) { /* ignore */ }
        }
        guestWs = ws;
        ws._coopRole = "guest";
      }
      sendPeerStatus();
      return;
    }
    if (msg.type === "state" && ws._coopRole === "host" && guestWs?.readyState === 1) {
      guestWs.send(String(raw));
    }
    if (msg.type === "input" && ws._coopRole === "guest" && hostWs?.readyState === 1) {
      hostWs.send(String(raw));
    }
  });

  ws.on("close", () => {
    if (ws === hostWs) hostWs = null;
    if (ws === guestWs) guestWs = null;
    sendPeerStatus();
  });
});

/** WebSocket-клиент для lobby relay (см. server/coop-server.mjs). */

const GUEST_KEYS = new Set(["arrowup", "arrowleft", "arrowdown", "arrowright", " "]);

export function connectCoop(url, { roomId, name, onMessage, onOpen, onClose } = {}) {
  const ws = new WebSocket(url);
  let opened = false;
  ws.addEventListener("open", () => {
    opened = true;
    ws.send(JSON.stringify({
      type: "hello",
      roomId: roomId ?? "public",
      name: name ?? "Player",
    }));
    onOpen?.();
  });
  ws.addEventListener("message", (ev) => {
    try {
      const parsed = JSON.parse(String(ev.data));
      onMessage?.(parsed);
    } catch {
      /* ignore */
    }
  });
  ws.addEventListener("close", (ev) => {
    onClose?.({
      opened,
      code: ev.code,
      reason: ev.reason,
    });
  });
  // Не вызывать onClose и на error — обычно всё равно придёт close (иначе двойное сообщение в UI).
  return {
    send(obj) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
      }
    },
    close() {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    },
    get ready() {
      return ws.readyState === WebSocket.OPEN;
    },
  };
}

/** Ввод гостя: только стрелки и пробел (не пересекаются с WASD хоста). */
export function attachGuestKeyCapture() {
  const set = new Set();
  const onDown = (event) => {
    const key = event.key.toLowerCase();
    if (GUEST_KEYS.has(key)) {
      set.add(key);
      event.preventDefault();
    }
  };
  const onUp = (event) => {
    const key = event.key.toLowerCase();
    if (GUEST_KEYS.has(key)) {
      set.delete(key);
      event.preventDefault();
    }
  };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  return {
    snapshotKeys() {
      return [...set];
    },
    dispose() {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      set.clear();
    },
  };
}

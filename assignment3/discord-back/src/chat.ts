import { WebSocketServer } from "ws";
import WebSocket = require("ws");

export function create_websocket_chat() {
  const ws_chat = new WebSocketServer({ noServer: true });

  ws_chat.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data, isBinary) {
      ws_chat.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary });
        }
      });
    });
  });

  return ws_chat;
}

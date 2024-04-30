import { WebSocketServer } from "ws";
import WebSocket = require("ws");

export const ws_voice = new WebSocketServer({ noServer: true });

ws_voice.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    ws_voice.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

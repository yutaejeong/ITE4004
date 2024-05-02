import { WebSocketServer } from "ws";
import WebSocket = require("ws");

export function create_websocket_camera() {
  const ws_camera = new WebSocketServer({ noServer: true });

  ws_camera.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data, isBinary) {
      ws_camera.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary });
        }
      });
    });
  });

  return ws_camera;
}

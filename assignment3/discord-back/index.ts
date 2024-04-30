// an example code from:
// https://www.npmjs.com/package/ws#server-broadcast

import { createServer } from "http";
import { WebSocketServer } from "ws";
import WebSocket = require("ws");
require("dotenv").config();

const server = createServer();
const ws_chat = new WebSocketServer({ noServer: true });
const ws_voice = new WebSocketServer({ noServer: true });
const ws_camera = new WebSocketServer({ noServer: true });

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

server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = new URL(request.url!, process.env.WS_SERVER);

  if (pathname === "/chat") {
    ws_chat.handleUpgrade(request, socket, head, function done(ws) {
      ws_chat.emit("connection", ws, request);
    });
  } else if (pathname === "/voice") {
    ws_voice.handleUpgrade(request, socket, head, function done(ws) {
      ws_voice.emit("connection", ws, request);
    });
  } else if (pathname === "/camera") {
    ws_camera.handleUpgrade(request, socket, head, function done(ws) {
      ws_camera.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8080);

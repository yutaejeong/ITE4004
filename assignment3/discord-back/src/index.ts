import { createServer } from "http";
import { ws_camera } from "./camera";
import { ws_chat } from "./chat";
import { ws_voice } from "./voice";

require("dotenv").config();

const server = createServer();

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

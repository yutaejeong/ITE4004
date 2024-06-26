import * as fs from "fs";
import * as path from "path";
import { createServer } from "http";
import { createServer as createSecureServer } from "https";
import { channels, ws_channels } from "./channels";

require("dotenv").config();

const server =
  process.env.HTTPS === "true"
    ? createSecureServer({
        key: fs.readFileSync(
          path.join(__dirname, `../${process.env.SSL_KEY_FILE}`),
        ),
        cert: fs.readFileSync(
          path.join(__dirname, `../${process.env.SSL_CRT_FILE}`),
        ),
      })
    : createServer();

server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = new URL(request.url!, process.env.WS_SERVER);

  // pathname: /channels
  if (pathname === "/channels") {
    ws_channels.handleUpgrade(request, socket, head, function done(ws) {
      ws_channels.emit("connection", ws, request);
    });
    return;
  }

  // pathname: /{channel_id}/{communicationtype}
  if (!/^\/[^\/]+\/[^\/]+\/?$/.test(pathname)) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const [_, channel_id, communicationtype] = pathname.match(
    /^\/([^\/]+)\/([^\/]+)/,
  )!;

  switch (communicationtype) {
    case "chat":
      const ws_chat = channels[channel_id].chat;
      ws_chat.handleUpgrade(request, socket, head, function done(ws) {
        ws_chat.emit("connection", ws, request);
      });
      break;
    case "voice":
      const ws_voice = channels[channel_id].voice;
      ws_voice.handleUpgrade(request, socket, head, function done(ws) {
        ws_voice.emit("connection", ws, request);
      });
      break;
    case "camera":
      const ws_camera = channels[channel_id].camera;
      ws_camera.handleUpgrade(request, socket, head, function done(ws) {
        ws_camera.emit("connection", ws, request);
      });
      break;
    default:
      socket.destroy();
      break;
  }
});

server.listen(8080);

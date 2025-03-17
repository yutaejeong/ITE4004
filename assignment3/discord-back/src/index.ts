import { createServer } from "http";
import { channels, ws_channels } from "./channels";

require("dotenv").config();

const PORT = process.env.PORT || 8080;

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.on("upgrade", function upgrade(request, socket, head) {
  const pathname = request.url?.split("?")[0];

  if (!pathname) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

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

  if (!channels[channel_id]) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
  }

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

server.listen(PORT || 8080, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

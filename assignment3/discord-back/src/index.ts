import { createServer } from "http";
import { channels, ws_channels } from "./channels";

require("dotenv").config();

const server = createServer();

server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = new URL(request.url!, process.env.WS_SERVER);
  console.log(`[upgrade] ${pathname}`);

  if (pathname === "/channels") {
    ws_channels.handleUpgrade(request, socket, head, function done(ws) {
      ws_channels.emit("connection", ws, request);
    });
    return;
  }

  if (!/^\/[^\/]+\/[^\/]+\/?$/.test(pathname)) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const [_, channel_id, communication_type] = pathname.match(
    /^\/([^\/]+)\/([^\/]+)/,
  )!;

  console.log(`[upgrade] ${channel_id} ${communication_type}`);

  switch (communication_type) {
    case "chat":
      console.log("[upgrade]");
      Object.entries(channels).forEach((channel) => {
        console.log(`\t${channel[0]}`);
      });
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
        ws_voice.emit("connection", ws, request);
      });
      break;
    default:
      socket.destroy();
      break;
  }
});

server.listen(8080);

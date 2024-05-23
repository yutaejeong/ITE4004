import { WebSocket, WebSocketServer } from "ws";
import { CameraWebSocketServer } from "./camera";
import { create_websocket_chat } from "./chat";
import { VoiceWebSocketServer } from "./voice";

interface Channel {
  owner: string;
  chat: WebSocketServer;
  voice: WebSocketServer;
  camera: WebSocketServer;
}

interface DataType {
  action: "create" | "delete";
  channel_id?: string;
  requester: string;
}

export const channels: Record<string, Channel> = {};

export const ws_channels = new WebSocketServer({ noServer: true });

async function sendCurrentChannels(ws: WebSocket) {
  const channel_list = Object.entries(channels).map(
    ([channel_id, channel]) => ({
      channel_id,
      owner: channel.owner,
    }),
  );
  ws.send(JSON.stringify(channel_list));
}

ws_channels.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(_data) {
    const data: DataType = JSON.parse(_data.toString());
    switch (data.action) {
      case "create":
        const { v4: uuidv4 } = require("uuid");
        const channel_id = uuidv4();
        const owner = data.requester;
        const chat = create_websocket_chat();
        const voice = new VoiceWebSocketServer();
        const camera = new CameraWebSocketServer();
        channels[channel_id] = {
          owner,
          chat,
          voice: voice.ws_voice,
          camera: camera.ws_camera,
        };
        break;
      case "delete":
        if (data.channel_id) {
          if (channels[data.channel_id].owner === data.requester) {
            channels[data.channel_id].chat.clients.forEach(
              function each(client) {
                client.close();
              },
            );
            channels[data.channel_id].chat.close();
            channels[data.channel_id].voice.clients.forEach(
              function each(client) {
                client.close();
              },
            );
            channels[data.channel_id].voice.close();
            channels[data.channel_id].camera.clients.forEach(
              function each(client) {
                client.close();
              },
            );
            channels[data.channel_id].camera.close();
            delete channels[data.channel_id];
          }
        }
        break;
    }

    ws_channels.clients.forEach(function each(client) {
      sendCurrentChannels(client);
    });
  });

  sendCurrentChannels(ws);
});

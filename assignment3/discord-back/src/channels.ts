import { WebSocket, WebSocketServer } from "ws";
import { create_websocket_camera } from "./camera";
import { create_websocket_chat } from "./chat";
import { create_websocket_voice } from "./voice";

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

async function generateId() {
  const { nanoid } = await import("nanoid");
  return nanoid();
}

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

  ws.on("message", async function message(_data) {
    console.log(`[message]\n${_data}`);

    const data: DataType = JSON.parse(_data.toString());
    switch (data.action) {
      case "create":
        const channel_id = await generateId();
        const owner = data.requester;
        const chat = create_websocket_chat();
        const voice = create_websocket_voice();
        const camera = create_websocket_camera();
        channels[channel_id] = {
          owner,
          chat,
          voice,
          camera,
        };
        console.log("a channel is created");
        console.log(`\tchannel_id: ${channel_id}`);
        console.log(`\towner: ${owner}`);
        break;
      case "delete":
        if (data.channel_id) {
          if (channels[data.channel_id].owner === data.requester) {
            channels[data.channel_id].chat.close();
            channels[data.channel_id].voice.close();
            channels[data.channel_id].camera.close();
          }
          delete channels[data.channel_id];
        }
        break;
    }

    ws_channels.clients.forEach(function each(client) {
      sendCurrentChannels(client);
    });
  });

  sendCurrentChannels(ws);
});

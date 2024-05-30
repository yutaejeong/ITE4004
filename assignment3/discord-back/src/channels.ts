import { WebSocket, WebSocketServer } from "ws";
import { CommunicationServer } from "./communication";
import { Channel, ChannelActions, ChannelResponse } from "./types";

export const channels: Record<string, Channel> = {};

export const ws_channels = new WebSocketServer({ noServer: true });

async function sendCurrentChannels(ws: WebSocket) {
  const channel_list: ChannelResponse["channels"] = Object.entries(
    channels,
  ).map(([channel_id, channel]) => ({
    owner: channel.owner,
    name: channel.name,
    id: channel_id,
  }));
  const message: ChannelResponse = { type: "list", channels: channel_list };
  ws.send(JSON.stringify(message));
}

ws_channels.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    const action: ChannelActions = JSON.parse(data.toString());
    switch (action.type) {
      case "create":
        const { v4: uuidv4 } = require("uuid");
        const channel_id = uuidv4();
        const owner = action.requester;
        const chat = new CommunicationServer();
        const voice = new CommunicationServer();
        const camera = new CommunicationServer();
        channels[channel_id] = {
          owner,
          name: action.channel_name,
          chat: chat.serverSocket,
          voice: voice.serverSocket,
          camera: camera.serverSocket,
        };
        break;
      case "delete":
        if (channels[action.channel_id].owner === action.requester) {
          channels[action.channel_id].chat.clients.forEach(
            function each(client) {
              client.close();
            },
          );
          channels[action.channel_id].chat.close();
          channels[action.channel_id].voice.clients.forEach(
            function each(client) {
              client.close();
            },
          );
          channels[action.channel_id].voice.close();
          channels[action.channel_id].camera.clients.forEach(
            function each(client) {
              client.close();
            },
          );
          channels[action.channel_id].camera.close();
          delete channels[action.channel_id];
        }
        break;
      case "update":
        if (channels[action.channel_id].owner === action.requester) {
          channels[action.channel_id].name = action.channel_name;
        }
        break;
    }

    ws_channels.clients.forEach(function each(client) {
      sendCurrentChannels(client);
    });
  });

  sendCurrentChannels(ws);
});

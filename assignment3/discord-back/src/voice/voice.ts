import { WebSocketServer } from "ws";
import WebSocket = require("ws");
import { Message, Participant } from "./types";

export class VoiceWebSocketServer {
  ws_voice: WebSocketServer;
  participants: Record<string, Participant> = {};

  constructor() {
    this.ws_voice = new WebSocketServer({ noServer: true });

    this.ws_voice.on("connection", (ws) => {
      const { v4: uuidv4 } = require("uuid");
      const clientId = uuidv4();

      const welcomeMessage: Message = {
        _type: "welcome",
        id: clientId,
        participants: Object.values(this.participants),
      };
      ws.send(JSON.stringify(welcomeMessage));

      this.participants[clientId] = {
        isVoiceOn: false,
        nickname: "",
        id: clientId,
      };

      const broadcast = (message: string | WebSocket.RawData) => {
        this.ws_voice.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message, {
              binary: false,
            });
          }
        });
      };

      const introduceNewbie = () => {
        const newbieMessage: Message = {
          _type: "newbie",
          newbie: this.participants[clientId],
        };
        broadcast(JSON.stringify(newbieMessage));
      };

      ws.on("error", console.error);

      ws.on("message", (data, isBinary) => {
        if (!isBinary) {
          const message = JSON.parse(data.toString()) as Message;
          switch (message._type) {
            case "introduce":
              this.participants[message.id].nickname = message.nickname;
              introduceNewbie();
              break;
            case "show":
              this.participants[message.sender_id].isVoiceOn = true;
              broadcast(data);
              break;
            case "hide":
              this.participants[message.sender_id].isVoiceOn = false;
              broadcast(data);
              break;
            default:
              broadcast(data);
          }
        }
      });

      ws.on("close", () => {
        const goodbyeMessage: Message = {
          _type: "goodbye",
          escapee: this.participants[clientId],
        };
        broadcast(JSON.stringify(goodbyeMessage));
        delete this.participants[clientId];
      });
    });
  }
}
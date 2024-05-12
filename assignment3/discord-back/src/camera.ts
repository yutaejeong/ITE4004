import { WebSocketServer } from "ws";
import WebSocket = require("ws");

interface Participant {
  id: string;
  nickname: string;
  isCameraOn: boolean;
}

export type Message =
  | {
      _type: "welcome";
      id: string;
      participants: Participant[];
    }
  | {
      _type: "introduce";
      id: string;
      nickname: string;
    }
  | {
      _type: "newbie";
      newbie: Participant;
    }
  | {
      _type: "goodbye";
      escapee: Participant;
    };

export class CameraWebSocketServer {
  ws_camera: WebSocketServer;
  participants: Record<string, Participant> = {};

  constructor() {
    this.ws_camera = new WebSocketServer({ noServer: true });

    this.ws_camera.on("connection", (ws) => {
      const { v4: uuidv4 } = require("uuid");
      const clientId = uuidv4();
      console.log("Client connected: ", clientId);

      this.participants[clientId] = {
        isCameraOn: false,
        nickname: "",
        id: clientId,
      };

      const welcomeMessage: Message = {
        _type: "welcome",
        id: clientId,
        participants: Object.values(this.participants),
      };
      ws.send(JSON.stringify(welcomeMessage));

      const introduceNewbie = () => {
        const newbieMessage: Message = {
          _type: "newbie",
          newbie: this.participants[clientId],
        };
        this.ws_camera.clients.forEach((client) => {
          if (client === ws) return;
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newbieMessage));
          }
        });
      };

      ws.on("error", console.error);

      ws.on("open", () => {
        console.log("client open: ", clientId);
      });

      ws.on("message", (data, isBinary) => {
        if (!isBinary) {
          const message = JSON.parse(data.toString()) as Message;
          switch (message._type) {
            case "introduce":
              this.participants[message.id].nickname = message.nickname;
              introduceNewbie();
              break;
            default:
              this.ws_camera.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(data, { binary: isBinary });
                }
              });
          }
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected: ", clientId);
        const goodbyeMessage: Message = {
          _type: "goodbye",
          escapee: this.participants[clientId],
        };
        this.ws_camera.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(goodbyeMessage));
          }
        });
        delete this.participants[clientId];
      });
    });
  }
}

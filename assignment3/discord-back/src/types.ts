import { WebSocketServer } from "ws";

export interface Participant {
  id: string;
  nickname: string;
  active: boolean;
}

export type Message =
  | {
      type: "data";
      sender_id: string;
      data: string;
    }
  | {
      type: "hide";
      sender_id: string;
    }
  | {
      type: "show";
      sender_id: string;
    }
  | {
      type: "welcome";
      id: string;
      participants: Participant[];
    }
  | {
      type: "introduce";
      id: string;
      nickname: string;
    }
  | {
      type: "newbie";
      newbie: Participant;
    }
  | {
      type: "goodbye";
      escapee: Participant;
    };

// Server-side
export interface Channel {
  owner: string;
  name: string;
  chat: WebSocketServer;
  voice: WebSocketServer;
  camera: WebSocketServer;
}

// Client -> Server
export type ChannelActions =
  | {
      type: "delete";
      channel_id: string;
      requester: string;
    }
  | {
      type: "create";
      channel_name: string;
      requester: string;
    }
  | {
      type: "update";
      channel_id: string;
      channel_name: string;
      requester: string;
    };

// Server -> Client
export type ChannelResponse = {
  type: "list";
  channels: {
    owner: string;
    name: string;
    id: string;
  }[];
};

import { WebSocketServer } from "ws";

export interface Participant {
  id: string;
  nickname: string;
  active: boolean;
}

export type Message =
  | {
      _type: "data";
      sender_id: string;
      data: string;
    }
  | {
      _type: "hide";
      sender_id: string;
    }
  | {
      _type: "show";
      sender_id: string;
    }
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
      _type: "delete";
      channel_id: string;
      requester: string;
    }
  | {
      _type: "create";
      channel_name: string;
      requester: string;
    }
  | {
      _type: "update";
      channel_id: string;
      channel_name: string;
      requester: string;
    };

// Server -> Client
export type ChannelResponse = {
  _type: "list";
  channels: {
    owner: string;
    name: string;
    id: string;
  }[];
};

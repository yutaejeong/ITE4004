export interface Participant {
  id: string;
  nickname: string;
}
export type MessageData =
  | {
      _type: "message";
      message_id: string;
      content: string;
      nickname: string;
    }
  | {
      _type: "announcement";
      announcement_id: string;
      action: "entrance" | "leave";
      nickname: string;
    };

export type Message =
  | {
      _type: "data";
      sender_id: string;
      data: MessageData;
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

export type PartialMessage = { _type: "data"; data: MessageData };

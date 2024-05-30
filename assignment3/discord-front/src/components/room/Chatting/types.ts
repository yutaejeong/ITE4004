export interface Participant {
  id: string;
  nickname: string;
}
export type MessageData =
  | {
      type: "message";
      message_id: string;
      content: string;
      nickname: string;
    }
  | {
      type: "announcement";
      announcement_id: string;
      action: "entrance" | "leave";
      nickname: string;
    };

export type Message =
  | {
      type: "data";
      sender_id: string;
      data: MessageData;
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

export type PartialMessage = { type: "data"; data: MessageData };

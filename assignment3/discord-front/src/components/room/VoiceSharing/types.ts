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

export type PartialMessage =
  | { type: "hide" }
  | { type: "show" }
  | { type: "data"; data: string };

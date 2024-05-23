export interface Participant {
  id: string;
  nickname: string;
  isCameraOn: boolean;
}

export type Message =
  | {
      _type: "video";
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

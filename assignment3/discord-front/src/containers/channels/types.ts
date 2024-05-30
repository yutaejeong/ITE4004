export interface Channel {
  owner: string;
  name: string;
  id: string;
}

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

export type ChannelResponse = {
  _type: "list";
  channels: Channel[];
};

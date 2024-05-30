export interface Channel {
  owner: string;
  name: string;
  id: string;
}

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

export type ChannelResponse = {
  type: "list";
  channels: Channel[];
};

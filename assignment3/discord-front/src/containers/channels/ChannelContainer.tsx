import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { channelAtom } from "../../atoms/channel";
import { userAtom } from "../../atoms/user";
import { ConfirmAlert } from "../../components/common";
import { usePreventReload } from "../../hooks/usePreventReload";
import "./ChannelContainer.css";
import { CreateChannelButton } from "./CreateChannelButton";
import { EditChannelButton } from "./EditChannelButton";
import { Channel, ChannelActions, ChannelResponse } from "./types";

export function ChannelContainer() {
  usePreventReload();

  const wsRef = useRef<WebSocket | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const { uuid } = useAtomValue(userAtom);
  const selectChannel = useSetAtom(channelAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_SERVER!}/channels`);

    ws.onmessage = (event) => {
      const message: ChannelResponse = JSON.parse(event.data);
      setChannels(message.channels);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  function createNewChannel(channelName: string) {
    if (wsRef.current) {
      const message: ChannelActions = {
        type: "create",
        requester: uuid,
        channel_name: channelName,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }

  function editChannel(channel_id: string, channelName: string) {
    if (wsRef.current) {
      const message: ChannelActions = {
        type: "update",
        requester: uuid,
        channel_id,
        channel_name: channelName,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }

  function deleteChannel(channel_id: string) {
    if (wsRef.current) {
      const message: ChannelActions = {
        type: "delete",
        channel_id,
        requester: uuid,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }

  return (
    <>
      <div className="container">
        <div className="channels-list">
          {channels.map(({ id, name, owner }) => (
            <ButtonGroup isAttached key={id}>
              <Button onClick={() => selectChannel(id)}>{name}</Button>
              {owner === uuid && (
                <>
                  <EditChannelButton
                    name={name}
                    onEdit={(channelName) => {
                      editChannel(id, channelName);
                    }}
                  />
                  <IconButton
                    onClick={() => onOpen()}
                    icon={<DeleteIcon />}
                    aria-label="delete the channel"
                  />
                  <ConfirmAlert
                    isOpen={isOpen}
                    onClose={onClose}
                    title={"정말로 채널을 삭제하시겠습니까?"}
                    description={
                      "현재 채널에 참여 중인 이용자들은 연결이 끊깁니다."
                    }
                    action_text={"삭제하기"}
                    action={() => deleteChannel(id)}
                  />
                </>
              )}
            </ButtonGroup>
          ))}
          <CreateChannelButton
            onCreate={(channelName) => createNewChannel(channelName)}
          />
        </div>
      </div>
    </>
  );
}

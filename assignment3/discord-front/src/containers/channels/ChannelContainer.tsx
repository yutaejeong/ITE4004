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

export function CHannelContainer() {
  usePreventReload();
  const wsRef = useRef<WebSocket | null>(null);
  const [channels, setChannels] = useState<
    { channel_id: string; owner: string }[]
  >([]);
  const { uuid } = useAtomValue(userAtom);
  const selectChannel = useSetAtom(channelAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_SERVER!}/channels`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setChannels([...message]);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  function createNewChannel() {
    if (wsRef.current) {
      const message = {
        action: "create",
        requester: uuid,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }

  function deleteChannel(channel_id: string) {
    if (wsRef.current) {
      const message = {
        action: "delete",
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
          {channels.map(({ channel_id, owner }) => (
            <ButtonGroup isAttached key={channel_id}>
              <Button onClick={() => selectChannel(channel_id)}>
                {channel_id}
              </Button>
              {owner === uuid && (
                <>
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
                    action={() => deleteChannel(channel_id)}
                  />
                </>
              )}
            </ButtonGroup>
          ))}
          <Button onClick={() => createNewChannel()}>체널 생성하기</Button>
        </div>
      </div>
    </>
  );
}

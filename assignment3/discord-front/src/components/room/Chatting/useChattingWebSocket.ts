import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { Message, MessageData, PartialMessage, Participant } from "./types";

interface Props {
  channel_id: string;
  nickname: string;
  onReceiveData: (data: MessageData) => void;
}

export function useCommunicate({ channel_id, nickname, onReceiveData }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef<string | null>(null);
  const sendMessageRef = useRef<(message: PartialMessage) => void>(() => {});
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_WS_SERVER!}/${channel_id}/chat`;
    const ws = new WebSocket(endpoint);

    wsRef.current = ws;
    sendMessageRef.current = (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        const _message: Message = {
          ...message,
          sender_id: idRef.current!,
        };
        ws.send(JSON.stringify(_message));
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      switch (message.type) {
        case "welcome":
          idRef.current = message.id;
          setParticipants(message.participants);
          const introduceMessage: Message = {
            type: "introduce",
            id: message.id,
            nickname,
          };
          ws.send(JSON.stringify(introduceMessage));
          break;
        case "newbie":
          setParticipants((prev) => [
            ...prev,
            { ...message.newbie, active: false },
          ]);
          onReceiveData({
            type: "announcement",
            announcement_id: nanoid(),
            action: "entrance",
            nickname: message.newbie.nickname,
          });
          break;
        case "data":
          onReceiveData(message.data);
          break;
        case "goodbye":
          setParticipants((prev) =>
            prev.filter((participant) => participant.id !== message.escapee.id),
          );
          onReceiveData({
            type: "announcement",
            announcement_id: nanoid(),
            action: "leave",
            nickname: message.escapee.nickname,
          });
          break;
      }
    };

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    };
  }, [channel_id, nickname, onReceiveData]);

  return {
    sendMessageRef,
    participants,
    getWSStatus: () => wsRef.current?.readyState ?? WebSocket.CLOSED,
  };
}

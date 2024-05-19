import { useEffect, useRef, useState } from "react";
import { Message, PartialMessage, Participant } from "./types";

interface Props {
  channel_id: string;
  nickname: string;
}

export const useCameraWebSocket = ({ channel_id, nickname }: Props) => {
  const videoContainersRef = useRef<Record<string, HTMLImageElement | null>>(
    {},
  );
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const sendMessageRef = useRef<(message: PartialMessage) => void>(() => {});

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_WS_SERVER!}/${channel_id}/camera`;
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
      switch (message._type) {
        case "welcome":
          idRef.current = message.id;
          setParticipants(message.participants);
          const introduceMessage: Message = {
            _type: "introduce",
            id: message.id,
            nickname,
          };
          ws.send(JSON.stringify(introduceMessage));
          break;
        case "newbie":
          setParticipants((prev) => [
            ...prev,
            { ...message.newbie, isCameraOn: false },
          ]);
          break;
        case "video":
          const videoContainer = videoContainersRef.current[message.sender_id];
          if (videoContainer) {
            videoContainer.src = message.data;
          }
          break;
        case "hide":
          setParticipants((prev) =>
            prev.map((participant) =>
              participant.id === message.sender_id
                ? { ...participant, isCameraOn: false }
                : participant,
            ),
          );
          break;
        case "show":
          setParticipants((prev) =>
            prev.map((participant) =>
              participant.id === message.sender_id
                ? { ...participant, isCameraOn: true }
                : participant,
            ),
          );
          break;
        case "goodbye":
          setParticipants((prev) =>
            prev.filter((participant) => participant.id !== message.escapee.id),
          );
          break;
      }
    };

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    };
  }, [channel_id, nickname]);

  return { participants, videoContainersRef, sendMessageRef };
};

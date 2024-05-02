import { useCallback, useEffect, useRef } from "react";
import { DefaultDataType } from "../types/common";

type CommunicationType = "chat" | "voice" | "camera";

interface Props<DataType extends DefaultDataType> {
  channel_id: string;
  communicationType: CommunicationType;
  onReceive: (receivedData: DataType) => void;
}

export function useCommunicate<DataType extends DefaultDataType>({
  channel_id,
  communicationType,
  onReceive,
}: Props<DataType>) {
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback(
    (sendingData: DataType) => wsRef.current?.send(JSON.stringify(sendingData)),
    [],
  );

  const getWSStatus = useCallback(() => wsRef.current?.readyState ?? -1, []);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.REACT_APP_WS_SERVER!}/${channel_id}/${communicationType}`,
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as DataType;
      onReceive(message);
    };

    return () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    };
  }, [channel_id, communicationType, onReceive]);

  return {
    sendMessage,
    getWSStatus,
  };
}

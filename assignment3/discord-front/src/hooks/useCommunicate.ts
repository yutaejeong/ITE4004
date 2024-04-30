import { useCallback, useEffect, useRef } from "react";
import { DefaultDataType } from "../types/common";

type CommunicationType = "chat" | "voice" | "camera";

interface Props<DataType extends DefaultDataType> {
  communicationType: CommunicationType;
  onReceive: (receivedData: DataType) => void;
}

export function useCommunicate<DataType extends DefaultDataType>({
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
      `${process.env.REACT_APP_WS_SERVER!}/${communicationType}`,
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
  }, [communicationType, onReceive]);

  return {
    sendMessage,
    getWSStatus,
  };
}

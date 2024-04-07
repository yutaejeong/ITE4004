import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  sender: string;
  content: string;
}

export function useCommunicate() {
  const [messages, setMessages] = useState<Message[]>([]);
  const sendMessages = useRef<WebSocket["send"] | null>(null);

  useEffect(() => {}, []);

  return { messages, sendMessages: sendMessages.current };
}

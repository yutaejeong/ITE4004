import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { channelAtom } from "../../../atoms/channel";
import { voiceConfigAtom } from "../../../atoms/control";
import { userAtom } from "../../../atoms/user";
import "./VoiceSharing.css";

interface Participant {
  id: string;
  nickname: string;
  isVoiceOn: boolean;
}

type Message =
  | {
      _type: "audio";
      sender_id: string;
      data: string;
      mime: string;
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

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: mimeType });
}

function playAudio(base64: string): Promise<void> {
  const audio = new Audio(base64);
  audio.onended = () => {
    URL.revokeObjectURL(audio.src);
  };
  audio.onerror = (error) => {
    console.error("cannot load audio: ", error);
  };
  return audio.play().catch((error) => {
    console.error("cannot play audio: ", error);
  });
}

export function VoiceSharing() {
  const isVoiceOn = useAtomValue(voiceConfigAtom);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const channel_id = useAtomValue(channelAtom);
  const { nickname } = useAtomValue(userAtom);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const idRef = useRef<string | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_WS_SERVER!}/${channel_id}/voice`;
    const ws = new WebSocket(endpoint);

    wsRef.current = ws;

    ws.onmessage = async (event) => {
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
          setParticipants((prev) => [...prev, message.newbie]);
          break;
        case "audio":
          const blob = base64ToBlob(message.data, message.mime);
          const url = URL.createObjectURL(blob);
          playAudio(url).finally(() => {
            URL.revokeObjectURL(url);
          });
          document
            .querySelectorAll(`.voice-${message.sender_id}`)
            .forEach((el) => {
              el.classList.add("voice-active");
              setTimeout(() => {
                el.classList.remove("voice-active");
              }, 1000);
            });
          break;
        case "hide":
          setParticipants((prev) =>
            prev.map((participant) =>
              participant.id === message.sender_id
                ? ({ ...participant, isVoiceOn: false } satisfies Participant)
                : participant,
            ),
          );
          break;
        case "show":
          setParticipants((prev) =>
            prev.map((participant) =>
              participant.id === message.sender_id
                ? ({ ...participant, isVoiceOn: true } satisfies Participant)
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

  // Turn on the mic and deliver the voice through the websocket (wsRef.current) every 1000 / 30 ms.
  async function handleVoiceOn() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: chunks.current[0].type });
      chunks.current = [];

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const base64String = await blobToBase64(blob);
        const message: Message = {
          sender_id: idRef.current!,
          data: base64String,
          mime: blob.type,
          _type: "audio",
        };
        wsRef.current?.send(JSON.stringify(message));
      }

      mediaRecorderRef.current?.start();
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
      }, 500);
    };
    mediaRecorderRef.current.start();
    setTimeout(() => {
      mediaRecorderRef.current?.stop();
    }, 500);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const showMessage: Message = {
        sender_id: idRef.current!,
        _type: "show",
      };
      wsRef.current?.send(JSON.stringify(showMessage));
    }
  }

  async function handleVoiceOff() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      mediaRecorderRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const hideMessage: Message = {
        sender_id: idRef.current!,
        _type: "hide",
      };
      wsRef.current?.send(JSON.stringify(hideMessage));
    }
  }

  useEffect(() => {
    if (isVoiceOn) {
      handleVoiceOn();
    } else {
      handleVoiceOff();
    }
  }, [isVoiceOn]);

  return (
    <Card className="voice-card">
      <CardHeader>
        <Heading size="md">Voices</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing={4}>
          {participants.map((participant) => (
            <div className={`voice-${participant.id}`} key={participant.id}>
              {participant.nickname}
              {participant.isVoiceOn ? "🔊" : "🔇"}
            </div>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
}

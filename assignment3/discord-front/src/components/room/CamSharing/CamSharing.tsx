import { Card, CardBody, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { channelAtom } from "../../../atoms/channel";
import { cameraConfigAtom } from "../../../atoms/control";
import "./CamSharing.css";

interface Participant {
  id: string;
  nickname: string;
  isCameraOn: boolean;
}

type Message =
  | {
      sender_id: string;
      data: string;
      _type: "video";
    }
  | {
      sender_id: string;
      _type: "hide";
    }
  | {
      _type: "welcome";
      id: string;
      participants: Participant[];
    }
  | {
      _type: "newbie";
      newbie: Participant;
    }
  | {
      _type: "goodbye";
      escapee: Participant;
    };

export function CamSharing() {
  const isCameraOn = useAtomValue(cameraConfigAtom);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const channel_id = useAtomValue(channelAtom);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const animateFunctionRef = useRef<number | null>(null);
  const videoContainersRef = useRef<Record<string, HTMLImageElement | null>>(
    {},
  );
  const lastSendRef = useRef<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    const endpoint = `${process.env.REACT_APP_WS_SERVER!}/${channel_id}/camera`;
    const ws = new WebSocket(endpoint);

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      switch (message._type) {
        case "welcome":
          idRef.current = message.id;
          setParticipants(message.participants);
          break;
        case "newbie":
          setParticipants((prev) => [
            ...prev,
            { ...message.newbie, isCameraOn: true },
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
  }, [channel_id]);

  async function handleTurnCameraOn() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { max: 640 },
          height: { max: 480 },
          frameRate: { max: 15 },
        },
      });
      videoRef.current = document.createElement("video");
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
      streamRef.current = stream;
    } catch (e) {
      alert("권한을 확인해주세요.");
    }
  }

  const handleTurnCameraOff = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(function each(track) {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
    if (
      wsRef.current &&
      idRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      const hideMessage: Message = {
        _type: "hide",
        sender_id: idRef.current,
      };
      wsRef.current.send(JSON.stringify(hideMessage));
    }
  }, []);

  useEffect(() => {
    if (isCameraOn) {
      handleTurnCameraOn();

      // send webcam data to websocket server with requestAnimationFrame
      function processWebcam() {
        const sendInterval = 1000 / 15;

        if (
          videoRef.current &&
          Date.now() - lastSendRef.current > sendInterval
        ) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (context) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(
              videoRef.current,
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const data = canvas.toDataURL("image/jpeg");
            if (
              wsRef.current &&
              idRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              const videoMessage: Message = {
                _type: "video",
                data,
                sender_id: idRef.current,
              };
              wsRef.current.send(JSON.stringify(videoMessage));
            }
            lastSendRef.current = Date.now();
          }
        }
        animateFunctionRef.current = requestAnimationFrame(processWebcam);
      }
      animateFunctionRef.current = requestAnimationFrame(processWebcam);
    } else {
      handleTurnCameraOff();
      if (animateFunctionRef.current) {
        cancelAnimationFrame(animateFunctionRef.current);
      }
    }
    return () => {
      handleTurnCameraOff();
      if (animateFunctionRef.current) {
        cancelAnimationFrame(animateFunctionRef.current);
      }
    };
  }, [handleTurnCameraOff, isCameraOn]);

  return (
    <Card className="cam-card">
      <CardBody className="cam-body">
        <Heading size="md">Cameras</Heading>
        <div className="cam-video-list">
          {participants.map((participant) => (
            <img
              className="cam-video"
              key={participant.id}
              ref={(_ref) => {
                videoContainersRef.current[participant.id] = _ref;
              }}
              alt={`${participant.nickname}님의 카메라 화면`}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

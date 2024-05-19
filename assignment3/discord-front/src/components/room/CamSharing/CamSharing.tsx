import { Card, CardBody, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { channelAtom } from "../../../atoms/channel";
import { cameraConfigAtom } from "../../../atoms/control";
import { userAtom } from "../../../atoms/user";
import "./CamSharing.css";

interface Participant {
  id: string;
  nickname: string;
  isCameraOn: boolean;
}

type Message =
  | {
      _type: "video";
      sender_id: string;
      data: string;
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
  const { nickname } = useAtomValue(userAtom);

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

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const showMessage: Message = {
          _type: "show",
          sender_id: idRef.current!,
        };
        wsRef.current.send(JSON.stringify(showMessage));
      }
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
          {participants.map((participant) =>
            participant.isCameraOn ? (
              <div
                key={`camera-${participant.id}`}
                className="cam-video-wrapper"
              >
                <img
                  className="cam-video"
                  ref={(_ref) => {
                    videoContainersRef.current[participant.id] = _ref;
                  }}
                  alt={`${participant.nickname}님의 카메라 화면`}
                />
                <span className="cam-video-label">{participant.nickname}</span>
              </div>
            ) : null,
          )}
        </div>
      </CardBody>
    </Card>
  );
}

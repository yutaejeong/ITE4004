import { Card, CardBody, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { channelAtom } from "../../../atoms/channel";
import { cameraConfigAtom } from "../../../atoms/control";
import { userAtom } from "../../../atoms/user";
import { useCommunicate } from "../../../hooks/useCommunicate";
import { User } from "../../../types/common";
import "./CamSharing.css";

interface Message {
  data: string;
  sender: User;
}

export function CamSharing() {
  const isCameraOn = useAtomValue(cameraConfigAtom);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const channel_id = useAtomValue(channelAtom);
  const currentUser = useAtomValue(userAtom);
  const [participants, setParticipants] = useState<User[]>([currentUser]);
  const animateFunctionRef = useRef<number | null>(null);
  const videoContainersRef = useRef<Record<string, HTMLImageElement | null>>(
    {},
  );
  const lastSendRef = useRef<number>(Date.now());

  const onReceive = useCallback((receivedData: Message) => {
    if (!videoContainersRef.current[receivedData.sender.uuid]) {
      setParticipants((prev) => [...prev, receivedData.sender]);
    } else {
      const img = videoContainersRef.current[receivedData.sender.uuid];
      if (img) {
        img.src = receivedData.data;
      }
    }
  }, []);

  const { sendMessage } = useCommunicate<Message>({
    channel_id,
    communicationType: "camera",
    onReceive,
  });

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
    sendMessage({ data: "", sender: currentUser });
  }, [currentUser, sendMessage]);

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
            sendMessage({ data, sender: currentUser });
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
  }, [currentUser, handleTurnCameraOff, isCameraOn, sendMessage]);

  return (
    <Card className="cam-card">
      <CardBody className="cam-body">
        <Heading size="md">Cameras</Heading>
        <div className="cam-video-list">
          {participants.map((participant) => (
            <img
              className="cam-video"
              key={participant.uuid}
              ref={(_ref) => {
                videoContainersRef.current[participant.uuid] = _ref;
              }}
              alt={`${participant.nickname}님의 카메라 화면`}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

import { RefObject, useCallback, useEffect, useRef } from "react";
import { PartialMessage } from "./types";

interface Props {
  isCameraOn: boolean;
  sendMessageRef: RefObject<(message: PartialMessage) => void>;
}

export const useCamera = ({ isCameraOn, sendMessageRef }: Props) => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalIdRef = useRef<NodeJS.Timer | null>(null);

  const handleTurnCameraOn = useCallback(async () => {
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
      videoRef.current.onloadeddata = () => {
        videoRef.current?.play();
      };
      streamRef.current = stream;

      sendMessageRef.current?.({ type: "show" });
    } catch (e) {
      alert("권한을 확인해주세요.");
      return;
    }
  }, [sendMessageRef]);

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
    sendMessageRef.current?.({ type: "hide" });
  }, [sendMessageRef]);

  const startToSendVideo = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg");
      sendMessageRef.current?.({ type: "data", data });
    }
  }, [sendMessageRef]);

  useEffect(() => {
    if (isCameraOn) {
      handleTurnCameraOn();
      intervalIdRef.current = setInterval(startToSendVideo, 1000 / 15);
    } else {
      handleTurnCameraOff();
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    }

    return () => {
      handleTurnCameraOff();
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [isCameraOn, handleTurnCameraOff, handleTurnCameraOn, startToSendVideo]);
};

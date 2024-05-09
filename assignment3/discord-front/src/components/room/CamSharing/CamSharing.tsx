import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { cameraConfigAtom } from "../../../atoms/control";
import "./CamSharing.css";

export function CamSharing() {
  const isCameraOn = useAtomValue(cameraConfigAtom);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function handleTurnCameraOn() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  function handleTurnCameraOff() {
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
  }

  useEffect(() => {
    if (isCameraOn) {
      handleTurnCameraOn();
    } else {
      handleTurnCameraOff();
    }
    return () => {
      handleTurnCameraOff();
    };
  }, [isCameraOn]);

  return (
    <Card className="cam-card">
      <CardHeader>
        <Heading size="md">Cameras</Heading>
      </CardHeader>
      <CardBody>{/* @todo */}</CardBody>
    </Card>
  );
}

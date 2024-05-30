import { RefObject, useCallback, useEffect, useRef } from "react";
import { PartialMessage } from "./types";

interface Props {
  isVoiceOn: boolean;
  sendMessageRef: RefObject<(message: PartialMessage) => void>;
}

export const useVoice = ({ isVoiceOn, sendMessageRef }: Props) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const handleVoiceOn = useCallback(async () => {
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

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target === null) {
          console.warn("Blob이 제대로 로드되지 않았습니다.");
          return;
        }
        const convertedDataURL = event.target.result;
        if (typeof convertedDataURL === "string") {
          sendMessageRef.current?.({
            type: "data",
            data: convertedDataURL,
          });
        } else {
          console.warn(
            "Blob이 DataURL로 올바르게 변환되지 않았습니다.",
            convertedDataURL,
          );
        }
      };
      reader.readAsDataURL(blob);

      mediaRecorderRef.current?.start();
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
      }, 500);
    };
    mediaRecorderRef.current.start();
    setTimeout(() => {
      mediaRecorderRef.current?.stop();
    }, 500);

    sendMessageRef.current?.({ type: "show" });
  }, [sendMessageRef]);

  const handleVoiceOff = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      mediaRecorderRef.current = null;
    }
    sendMessageRef.current?.({ type: "hide" });
  }, [sendMessageRef]);

  useEffect(() => {
    if (isVoiceOn) {
      handleVoiceOn();
    } else {
      handleVoiceOff();
    }
  }, [handleVoiceOff, handleVoiceOn, isVoiceOn]);
};

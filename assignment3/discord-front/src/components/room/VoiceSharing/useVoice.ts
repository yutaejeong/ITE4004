import { RefObject, useCallback, useEffect, useRef } from "react";
import { PartialMessage } from "./types";
import { blobToBase64 } from "./utils";

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

      const base64String = await blobToBase64(blob);
      sendMessageRef.current?.({
        data: base64String,
        mime: blob.type,
        _type: "audio",
      });

      mediaRecorderRef.current?.start();
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
      }, 500);
    };
    mediaRecorderRef.current.start();
    setTimeout(() => {
      mediaRecorderRef.current?.stop();
    }, 500);

    sendMessageRef.current?.({ _type: "show" });
  }, [sendMessageRef]);

  const handleVoiceOff = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      mediaRecorderRef.current = null;
    }
    sendMessageRef.current?.({ _type: "hide" });
  }, [sendMessageRef]);

  useEffect(() => {
    if (isVoiceOn) {
      handleVoiceOn();
    } else {
      handleVoiceOff();
    }
  }, [handleVoiceOff, handleVoiceOn, isVoiceOn]);
};

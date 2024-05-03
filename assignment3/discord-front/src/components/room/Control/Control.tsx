import { Button, Card, CardBody, Heading, Stack } from "@chakra-ui/react";
import { useAtom, useSetAtom } from "jotai";
import { unselectChannelAtom } from "../../../atoms/channel";
import { cameraConfigAtom, voiceConfigAtom } from "../../../atoms/control";
import "./Control.css";

export function Control() {
  const [isCameraOn, setIsCameraOn] = useAtom(cameraConfigAtom);
  const [isVoiceOn, setIsVoiceOn] = useAtom(voiceConfigAtom);
  const unselectChannel = useSetAtom(unselectChannelAtom);

  return (
    <Card className="control-card">
      <CardBody>
        <Stack>
          <Heading size="md">Controls</Heading>
          <Button onClick={() => setIsCameraOn((prev) => !prev)}>
            {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
          </Button>
          <Button onClick={() => setIsVoiceOn((prev) => !prev)}>
            {isVoiceOn ? "마이크 끄기" : "마이크 켜기"}
          </Button>
          <Button onClick={() => unselectChannel()}>채널 나가기</Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

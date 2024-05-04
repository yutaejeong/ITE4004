import {
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useAtom, useSetAtom } from "jotai";
import { unselectChannelAtom } from "../../../atoms/channel";
import { cameraConfigAtom, voiceConfigAtom } from "../../../atoms/control";
import { ConfirmAlert } from "../../common";
import "./Control.css";

export function Control() {
  const [isCameraOn, setIsCameraOn] = useAtom(cameraConfigAtom);
  const [isVoiceOn, setIsVoiceOn] = useAtom(voiceConfigAtom);
  const unselectChannel = useSetAtom(unselectChannelAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
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
            <Button onClick={() => onOpen()}>채널 나가기</Button>
          </Stack>
        </CardBody>
      </Card>
      <ConfirmAlert
        isOpen={isOpen}
        onClose={onClose}
        title={"정말로 채널을 떠나게시겠습니까?"}
        description={"채팅 기록은 복원되지 않습니다."}
        action_text={"나가기"}
        action={() => unselectChannel()}
      />
    </>
  );
}

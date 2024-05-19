import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { channelAtom } from "../../../atoms/channel";
import { voiceConfigAtom } from "../../../atoms/control";
import { userAtom } from "../../../atoms/user";
import "./VoiceSharing.css";
import { useVoice } from "./useVoice";
import { useVoiceWebSocket } from "./useVoiceWebSocket";

export function VoiceSharing() {
  const isVoiceOn = useAtomValue(voiceConfigAtom);
  const channel_id = useAtomValue(channelAtom);
  const { nickname } = useAtomValue(userAtom);
  const { participants, sendMessageRef } = useVoiceWebSocket({
    channel_id,
    nickname,
  });

  useVoice({ isVoiceOn, sendMessageRef });

  return (
    <Card className="voice-card">
      <CardHeader>
        <Heading size="md">Voices</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing={4}>
          {participants.map((participant) =>
            participant.isVoiceOn ? (
              <div className={`voice-${participant.id}`} key={participant.id}>
                {participant.nickname}
              </div>
            ) : null,
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

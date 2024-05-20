import { Avatar, Card, CardBody, Heading, Stack } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";
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
      <CardBody className="voice-body">
        <Heading size="md">Voices</Heading>
        <Stack className="voice-audio-list" spacing={2}>
          {participants.map((participant) => (
            <div className="voice-audio" key={`voice-${participant.id}`}>
              <Avatar size="sm" name={participant.nickname} />
              <span className="voice-audio-label">{participant.nickname}</span>
              {participant.isVoiceOn ? (
                <BsMicFill className="voice-audio-mic-on" />
              ) : (
                <BsMicMuteFill className="voice-audio-mic-off" />
              )}
            </div>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
}

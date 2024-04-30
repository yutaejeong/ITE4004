import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { voiceConfigAtom } from "../../../atoms/control";
import "./VoiceSharing.css";

export function VoiceSharing() {
  const isVoiceOn = useAtomValue(voiceConfigAtom);

  console.log(isVoiceOn);

  return (
    <Card className="voice-card">
      <CardHeader>
        <Heading size="md">Voices</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing={4}>
          {/* @todo */}
        </Stack>
      </CardBody>
    </Card>
  );
}

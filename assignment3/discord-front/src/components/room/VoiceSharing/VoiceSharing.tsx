import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import "./VoiceSharing.css";

export function VoiceSharing() {
  return (
    <Card className="voice-card">
      <CardHeader>
        <Heading size="md">Members</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing={4}>
          {/* @todo */}
        </Stack>
      </CardBody>
    </Card>
  );
}

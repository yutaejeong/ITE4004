import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { cameraConfigAtom } from "../../../atoms/control";
import "./CamSharing.css";

export function CamSharing() {
  const isCameraOn = useAtomValue(cameraConfigAtom);

  console.log(isCameraOn);

  return (
    <Card className="cam-card">
      <CardHeader>
        <Heading size="md">Cameras</Heading>
      </CardHeader>
      <CardBody>{/* @todo */}</CardBody>
    </Card>
  );
}

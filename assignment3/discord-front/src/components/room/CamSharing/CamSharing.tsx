import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import "./CamSharing.css";

export function CamSharing() {
  return (
    <Card className="cam-card">
      <CardHeader>
        <Heading size="md">Cameras</Heading>
      </CardHeader>
      <CardBody>{/* @todo */}</CardBody>
    </Card>
  );
}

import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import "./Control.css";

export function Control() {
  return (
    <Card className="control-card">
      <CardHeader>
        <Heading size="md">Controls</Heading>
      </CardHeader>
      <CardBody>{/* @todo */}</CardBody>
    </Card>
  );
}

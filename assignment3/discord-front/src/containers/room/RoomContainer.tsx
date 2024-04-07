import { Heading } from "@chakra-ui/react";
import { Chatting } from "../../components";
import { usePreventReload } from "../../hooks/usePreventReload";
import "./RoomContainer.css";

interface Props {
  nickname: string;
}

export function RoomContainer({ nickname }: Props) {
  usePreventReload();

  return (
    <div className="container">
      <Heading>{nickname}</Heading>
      <Chatting />
    </div>
  );
}

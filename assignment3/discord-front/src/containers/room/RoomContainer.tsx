import { CamSharing, Chatting, VoiceSharing } from "../../components/room";
import { Control } from "../../components/room/Control";
import { usePreventReload } from "../../hooks/usePreventReload";
import "./RoomContainer.css";

interface Props {
  nickname: string;
}

export function RoomContainer({ nickname }: Props) {
  usePreventReload();

  return (
    <div className="room-container">
      <div className="voice-area">
        <VoiceSharing />
      </div>
      <div className="control-area">
        <Control />
      </div>
      <div className="cam-area">
        <CamSharing />
      </div>
      <div className="chat-area">
        <Chatting />
      </div>
    </div>
  );
}

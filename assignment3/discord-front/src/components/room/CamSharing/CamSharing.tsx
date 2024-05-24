import { Card, CardBody, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { channelAtom } from "../../../atoms/channel";
import { cameraConfigAtom } from "../../../atoms/control";
import { userAtom } from "../../../atoms/user";
import "./CamSharing.css";
import { useCamera } from "./useCamera";
import { useCameraWebSocket } from "./useCameraWebSocket";
import { BsFillCameraVideoOffFill } from "react-icons/bs";

export function CamSharing() {
  const channel_id = useAtomValue(channelAtom);
  const { nickname } = useAtomValue(userAtom);
  const { sendMessageRef, videoContainersRef, participants } =
    useCameraWebSocket({
      channel_id,
      nickname,
    });
  const isCameraOn = useAtomValue(cameraConfigAtom);

  useCamera({ isCameraOn, sendMessageRef });

  return (
    <Card className="cam-card">
      <CardBody className="cam-body">
        <Heading size="md">Cameras</Heading>
        <div className="cam-video-list">
          {participants.map((participant) =>
            participant.active ? (
              <div
                key={`camera-${participant.id}`}
                className="cam-video-wrapper"
              >
                <img
                  className="cam-video"
                  ref={(_ref) => {
                    videoContainersRef.current[participant.id] = _ref;
                  }}
                  alt={`${participant.nickname}님의 카메라 화면`}
                  style={{ display: "none" }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
                <span className="cam-video-label">{participant.nickname}</span>
              </div>
            ) : (
              <div
                key={`no-camera-${participant.id}`}
                className="cam-video-wrapper"
              >
                <BsFillCameraVideoOffFill className="cam-video-no-video" />
                <span className="cam-video-label">{participant.nickname}</span>
              </div>
            ),
          )}
        </div>
      </CardBody>
    </Card>
  );
}

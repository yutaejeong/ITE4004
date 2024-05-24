import { Card, CardBody, Heading } from "@chakra-ui/react";
import { FieldValidator, FormikHelpers } from "formik";
import { useAtomValue } from "jotai";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { channelAtom } from "../../../atoms/channel";
import { userAtom } from "../../../atoms/user";
import { FormikForm } from "../../common";
import "./Chatting.css";
import { MessageData, PartialMessage } from "./types";
import { useCommunicate } from "./useChattingWebSocket";

interface FormikValue {
  message: string;
}

export function Chatting() {
  const { nickname } = useAtomValue(userAtom);
  const channel_id = useAtomValue(channelAtom);
  const [received, setReceived] = useState<MessageData[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  const onReceiveData = useCallback(
    (messageData: MessageData) => {
      setReceived((prev) => [...prev, messageData]);
    },
    [setReceived],
  );

  const { sendMessageRef, getWSStatus } = useCommunicate({
    channel_id,
    nickname,
    onReceiveData,
  });

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [received]);

  const onSubmit = (
    values: FormikValue,
    actions: FormikHelpers<FormikValue>,
  ) => {
    if (values.message === "") {
      actions.setErrors({ message: "메시지를 입력해주세요." });
      actions.setSubmitting(false);
      return;
    }
    const message: PartialMessage = {
      _type: "data",
      data: {
        _type: "message",
        message_id: nanoid(),
        content: values.message,
        nickname,
      },
    };
    sendMessageRef.current(message);
    actions.setSubmitting(false);
    actions.resetForm();
  };

  const validator: FieldValidator = (_value: string) => {
    if (getWSStatus() !== WebSocket.OPEN) {
      return "서버에 연결되지 않았습니다.";
    }
  };

  return (
    <Card className="chat-card">
      <CardBody className="chat-card-body">
        <Heading size="md">Messages</Heading>
        <div className="history" ref={historyRef}>
          {received.map((messageData) =>
            messageData._type === "message" ? (
              <p className="message" key={messageData.message_id}>
                <span className="sender">[{messageData.nickname}]</span>
                {messageData.content}
              </p>
            ) : (
              <p className="announcement" key={messageData.announcement_id}>
                <span className="sender">{messageData.nickname}</span>
                {messageData.action === "entrance"
                  ? "님이 입장하셨습니다."
                  : "님이 퇴장하셨습니다."}
              </p>
            ),
          )}
        </div>
        <FormikForm
          className="input-area"
          initialValues={{ message: "" }}
          onSubmit={onSubmit}
          placeholder={"메시지"}
          validator={validator}
          buttonText={"전송"}
        />
      </CardBody>
    </Card>
  );
}

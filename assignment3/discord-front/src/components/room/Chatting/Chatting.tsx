import { Card, CardBody, Heading } from "@chakra-ui/react";
import { FieldValidator, FormikHelpers } from "formik";
import { useAtomValue } from "jotai";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { userAtom } from "../../../atoms/user";
import { useCommunicate } from "../../../hooks/useCommunicate";
import { User } from "../../../types/common";
import { FormikForm } from "../../common";
import "./Chatting.css";

interface FormikValue {
  message: string;
}

interface MessageType {
  sender: User;
  message: string;
  message_id: string;
}

export function Chatting() {
  const nickname = useAtomValue(userAtom);
  const [received, setReceived] = useState<MessageType[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);
  const onReceive = useCallback((receivedData: MessageType) => {
    setReceived((prev) => [...prev, receivedData]);
  }, []);
  const { sendMessage, getWSStatus } = useCommunicate<MessageType>({
    communicationType: "chat",
    onReceive,
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
    const message = {
      sender: nickname,
      message: values.message,
      message_id: nanoid(),
    };
    sendMessage(message);
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
          {received.map((message) => (
            <p className="message" key={message.message_id}>
              <span className="sender">[{message.sender.nickname}]</span>
              {message.message}
            </p>
          ))}
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

import { FieldValidator, FormikHelpers } from "formik";
import { useEffect, useRef, useState } from "react";
import { FormikForm } from "../../common";
import "./Chatting.css";
import { Card, CardBody } from "@chakra-ui/react";

interface FormikValue {
  message: string;
}

type WebSocketState =
  | WebSocket["OPEN"]
  | WebSocket["CLOSED"]
  | WebSocket["CONNECTING"]
  | WebSocket["CLOSING"];

export function Chatting() {
  const [received, setReceived] = useState<string[]>([]);
  const wsState = useRef<WebSocketState | null>(null);
  const sendMessage = useRef<WebSocket["send"] | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [received]);

  /**
   * @todo
   * 웹소켓 개통 및 이벤트 핸들링 관련 코드 useCommunicate로 이동
   * 메시지, 오디오, 비디오 송수신 및 상태 관리는 해당 훅에서 한 번에 다룰 예정
   */
  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_SERVER!);

    sendMessage.current = ws.send.bind(ws);

    ws.onopen = () => {
      wsState.current = ws.OPEN;
    };

    ws.onmessage = (event) => {
      setReceived((prev) => [...prev, event.data]);
    };

    ws.onerror = () => {
      wsState.current = ws.CLOSED;
    };

    ws.onclose = () => {
      wsState.current = ws.CLOSED;
    };

    return () => ws.close();
  }, []);

  const onSubmit = (
    values: FormikValue,
    actions: FormikHelpers<FormikValue>,
  ) => {
    if (values.message === "") {
      actions.setErrors({ message: "메시지를 입력해주세요." });
      actions.setSubmitting(false);
      return;
    }
    if (sendMessage.current) {
      sendMessage.current(values.message);
      actions.setSubmitting(false);
    } else {
      actions.setErrors({ message: "오류" });
    }
    actions.resetForm();
  };

  const validator: FieldValidator = (_value: string) => {
    if (wsState.current !== WebSocket.OPEN) {
      return "서버에 연결되지 않았습니다.";
    }
  };

  return (
    <Card className="chat-card">
      <CardBody className="chat-card-body">
        <div className="history" ref={historyRef}>
          {received.map((message) => (
            <p className="message">
              <span className="sender">[익명]</span>
              {message}
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

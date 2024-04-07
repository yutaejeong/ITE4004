import { FieldValidator, FormikHelpers } from "formik";
import { useEffect, useRef, useState } from "react";
import { FormikForm } from "../FormikForm";
import "./Chatting.css";

interface FormikValue {
  message: string;
}

export function Chatting() {
  const [received, setReceived] = useState<string[]>([]);
  const sendMessage = useRef<WebSocket["send"] | null>(null);

  /**
   * @todo
   * 웹소켓 개통 및 이벤트 핸들링 관련 코드 useCommunicate로 이동
   * 메시지, 오디오, 비디오 송수신 및 상태 관리는 해당 훅에서 한 번에 다룰 예정
   */
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send("Hello, World!");
    };

    sendMessage.current = ws.send.bind(ws);

    ws.onmessage = (event) => {
      setReceived((prev) => [...prev, event.data]);
    };

    return () => ws.close();
  }, []);

  const onSubmit = (
    values: FormikValue,
    actions: FormikHelpers<FormikValue>,
  ) => {
    if (sendMessage.current) {
      sendMessage.current(values.message);
      actions.setSubmitting(false);
    } else {
      actions.setErrors({ message: "오류" });
    }
    actions.resetForm();
  };

  const validator: FieldValidator = (value: string) => {
    if (!value) {
      return "메시지를 입력해주세요.";
    }
    if (!sendMessage) {
      return "서버에 연결되지 않았습니다.";
    }
  };

  return (
    <div>
      <ul>
        {received.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
      <FormikForm
        className="input-area"
        initialValues={{ message: "" }}
        onSubmit={onSubmit}
        placeholder={"메시지"}
        validator={validator}
        buttonText={"전송"}
      />
    </div>
  );
}

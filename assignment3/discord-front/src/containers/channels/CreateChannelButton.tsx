import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FormikHelpers } from "formik";
import { useRef } from "react";
import { FormikForm } from "../../components/common";

interface FormikValue {
  channelName: string;
}

interface Props {
  onCreate: (channelName: string) => void;
}

export function CreateChannelButton({ onCreate }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = useRef<HTMLInputElement>(null);

  const onSubmit = (
    values: FormikValue,
    _actions: FormikHelpers<FormikValue>,
  ) => {
    onCreate(values.channelName);
    onClose();
  };

  function validateChannelName(channelName: string) {
    if (!channelName) {
      return "채널 이름을 입력해주세요.";
    }
  }

  return (
    <>
      <Button onClick={() => onOpen()}>채널 생성하기</Button>
      <Modal
        initialFocusRef={ref}
        finalFocusRef={ref}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>채널 생성</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormikForm
              initialValues={{ channelName: "" }}
              onSubmit={onSubmit}
              placeholder="채널 이름"
              validator={validateChannelName}
              buttonText="생성하기"
              style={{ display: "flex", gap: "12px" }}
              inputRef={ref}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

import { EditIcon } from "@chakra-ui/icons";
import {
  IconButton,
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
  name: string;
  onEdit: (channelName: string) => void;
}

export function EditChannelButton({ name, onEdit }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = useRef<HTMLInputElement>(null);

  const onSubmit = (
    values: FormikValue,
    _actions: FormikHelpers<FormikValue>,
  ) => {
    onEdit(values.channelName);
    onClose();
  };

  function validateChannelName(channelName: string) {
    if (!channelName) {
      return "채널 이름을 입력해주세요.";
    }
  }

  return (
    <>
      <IconButton
        icon={<EditIcon />}
        aria-label="edit the channel"
        onClick={() => onOpen()}
      />
      <Modal
        initialFocusRef={ref}
        finalFocusRef={ref}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>채널 수정</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormikForm
              initialValues={{ channelName: name }}
              onSubmit={onSubmit}
              placeholder="채널 이름"
              validator={validateChannelName}
              buttonText="수정하기"
              style={{ display: "flex", gap: "12px" }}
              inputRef={ref}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

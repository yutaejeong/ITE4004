import { Heading } from "@chakra-ui/react";
import { FormikHelpers } from "formik";
import { Dispatch, SetStateAction } from "react";
import { FormikForm } from "../../components";
import "./LoginContainer.css";

interface Props {
  setNickname: Dispatch<SetStateAction<string>>;
}

interface FormikValue {
  nickname: string;
}

export function LoginContainer({ setNickname }: Props) {
  const onSubmit = (
    values: FormikValue,
    _actions: FormikHelpers<FormikValue>,
  ) => {
    setNickname(values.nickname);
  };

  const validateName = (value: string) => {
    if (!value) {
      return "사용자명을 입력해주세요.";
    }
  };

  return (
    <div className="container">
      <Heading size="3xl" color="white">
        Welcome ✨
      </Heading>
      <FormikForm
        className="login-area"
        initialValues={{ nickname: "" }}
        onSubmit={onSubmit}
        placeholder={"사용자명"}
        validator={validateName}
        buttonText={"제출"}
      />
    </div>
  );
}

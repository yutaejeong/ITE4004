import { Heading } from "@chakra-ui/react";
import { FormikHelpers } from "formik";
import { useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { userAtom } from "../../atoms/user";
import { FormikForm } from "../../components/common";
import "./LoginContainer.css";

interface FormikValue {
  nickname: string;
}

export function LoginContainer() {
  const setUser = useSetAtom(userAtom);

  const onSubmit = (
    values: FormikValue,
    _actions: FormikHelpers<FormikValue>,
  ) => {
    setUser({
      nickname: values.nickname,
      uuid: nanoid(),
    });
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

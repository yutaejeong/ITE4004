import { Button, FormControl, FormErrorMessage, Input } from "@chakra-ui/react";
import {
  Field,
  FieldValidator,
  Form,
  Formik,
  FormikConfig,
  FormikValues,
} from "formik";
import { HTMLAttributes, RefObject } from "react";

interface Props<T extends FormikValues>
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  initialValues: T;
  onSubmit: FormikConfig<T>["onSubmit"];
  placeholder: string;
  validator: FieldValidator;
  buttonText: string;
  inputRef?: RefObject<HTMLInputElement>;
}

export function FormikForm<T extends FormikValues>({
  initialValues,
  onSubmit,
  placeholder,
  validator,
  buttonText,
  inputRef,
  ...rest
}: Props<T>) {
  const filedName = Object.keys(initialValues)[0];

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(props) => (
        <Form {...rest}>
          <Field name={filedName} validate={validator}>
            {({ field, form }: any) => (
              <FormControl
                isInvalid={form.errors[filedName] && form.touched[filedName]}
              >
                <Input
                  {...field}
                  placeholder={placeholder}
                  autoComplete="off"
                  ref={inputRef}
                />
                <FormErrorMessage>{form.errors[filedName]}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button
            colorScheme="blue"
            isLoading={props.isSubmitting}
            type="submit"
          >
            {buttonText}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

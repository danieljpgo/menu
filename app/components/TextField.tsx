import * as React from "react";
import { Input, Label } from "~/components";
import Hint from "./Hint";

type TextFieldProps = {
  id: string;
  label: string;
  name: string;
  hint?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  status?: "error";
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(props, ref) {
    const {
      id,
      hint,
      label,
      name,
      disabled,
      required,
      value,
      defaultValue,
      status,
    } = props;

    return (
      <div>
        <Label
          htmlFor={id}
          status={status}
          required={required}
          disabled={disabled}
        >
          {label}
        </Label>
        <Input
          id={id}
          ref={ref}
          type="text"
          name={name}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
        />
        {hint && (
          <Hint htmlFor={id} status={status}>
            {hint}
          </Hint>
        )}
      </div>
    );
  }
);

export default TextField;

// @TODO: Add animations for hint

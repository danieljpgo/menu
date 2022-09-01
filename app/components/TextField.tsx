import * as React from "react";
import { Input, Label } from "~/components";

type TextFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(props, ref) {
    const { id, label, name, disabled, required, value, defaultValue } = props;
    return (
      <div>
        <Label status={disabled ? "disabled" : "none"} htmlFor={id}>
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
      </div>
    );
  }
);

export default TextField;

import * as React from "react";
import { Label, Select } from "~/components";

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: React.SelectHTMLAttributes<HTMLSelectElement>["value"];
  defaultValue?: React.SelectHTMLAttributes<HTMLSelectElement>["value"];
  disabled?: boolean;
  children?: React.ReactNode;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(props, ref) {
    const {
      children,
      id,
      label,
      name,
      disabled,
      required = false,
      value,
      defaultValue,
      onChange,
    } = props;

    return (
      <div>
        <Label status={disabled ? "disabled" : "none"} htmlFor={id}>
          {label}
        </Label>
        <Select
          ref={ref}
          id={id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          onChange={onChange}
        >
          {children}
        </Select>
      </div>
    );
  }
);

export default SelectField;

// @TODO better type

import * as React from "react";
import { Label, Select, Hint } from "~/components";

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  hint?: string;
  status?: "error";
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
      hint,
      id,
      label,
      name,
      disabled,
      status,
      required = false,
      value,
      defaultValue,
      onChange,
    } = props;

    return (
      <div>
        <Label
          disabled={disabled}
          htmlFor={id}
          required={required}
          status={status}
        >
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
          aria-invalid={Boolean(hint && status === "error")}
          aria-errormessage={
            hint && status === "error"
              ? `${id}-hint-${status ?? ""}`
              : undefined
          }
        >
          {children}
        </Select>
        {hint && (
          <Hint
            id={`${id}-hint-${status ?? ""}`}
            status={status}
            disabled={disabled}
          >
            {hint}
          </Hint>
        )}
      </div>
    );
  }
);

export default SelectField;

// @TODO better type

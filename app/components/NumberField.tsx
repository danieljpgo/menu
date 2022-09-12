import * as React from "react";
import { Input, Label } from "~/components";

type NumberFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  pattern?: string;
  children?: React.ReactNode;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(props, ref) {
    const {
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
        <Label disabled={disabled} htmlFor={id} required={required}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={id}
          type="number"
          name={name}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 disabled:bg-gray-50 disabled:opacity-75"
        />
      </div>
    );
  }
);

export default NumberField;

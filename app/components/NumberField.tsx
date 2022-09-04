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
};

export default function NumberField(props: NumberFieldProps) {
  const {
    id,
    label,
    name,
    disabled,
    required = false,
    value,
    defaultValue,
  } = props;

  return (
    <div>
      <Label disabled={disabled} htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 disabled:bg-gray-50 disabled:opacity-75"
      />
    </div>
  );
}
